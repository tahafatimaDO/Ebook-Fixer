import ePub from 'epubjs'

// The id of the div that should contain the viewer
export const viewerId = 'epubviewer'

/**
 * This class is used to store information about images in the book.
 * A list of these is generated when the e-book is opened.
 */
export class ImageInfo {
    /**
     * Constructor for the ImageInfo object,
     * this is to organize the code such that it's clear what information is being used where and how
     *
     * @param {HTMLImageElement} element Element of the image from the pre-rendered (not final) document
     * @param {EpubJS Section http://epubjs.org/documentation/0.3/#section} section Section of the book
     * @param {{href: path to image inside the book, type: type of the image, ...}} asset Path & type of the image
     * @param {String} replacementUrl The blob url generated by EpubJS for this asset
     */
    constructor(element, section, asset, replacementUrl) {
        // So we can get the image's metadata, e.g. alt text
        this.element = element
        // So we can find the section of the book the image is in
        this.section = section
        // Contains href attribute for the path of the image
        this.asset = asset
        // For finding the element in the rendered book
        this.replacementUrl = replacementUrl
    }
}

/**
 * This function is called onload from the FileReader.
 * It uses epubJS to open the book and display it.
 * Also registers a hook on when the veiwer loads content to execute getImagesOnScreen
 *
 * @param {ArrayBuffer} e Returned by the FileReader
 * @param {function: () => boolean} getRendered Getter for the rendered variable, to see if the editor is already rendered
 * @param {function: (boolean) => void} setRendered Setter for the rendered variable, to set it to true
 * @param {function: (list of ImageInfo) => void} setImageList Setter for the image list state
 * @param {function: (epubJS Rendition http://epubjs.org/documentation/0.3/#rendition) => void} setRendition Setter for the rendition
 */
export function openBook(
    e,
    getRendered,
    setRendered,
    setImageList,
    setRendition
) {
    // Get the opened book
    const bookData = e.target.result

    // Initialise epubJS
    const book = ePub()

    // Open (unzip) the book using epubJS
    book.open(bookData)

    // Make sure that only one epub is being rendered at once.
    if (getRendered()) return

    // Reset the veiwer's inner html so that the old epub is gone
    document.getElementById(viewerId).textContent = ''

    setRendered(true)

    const height = window.innerHeight * 0.7

    // Render the epub using the epubJS viewer
    const rendition = book.renderTo(viewerId, {
        // Scrolling instead of pages
        flow: 'scrolled',
        // Try to load per file, as much of the epub at once as we can
        manager: 'continuous',
        // TODO: experiment with the parameters for epubJS, they aren't very well documented
        // layout: "pre-paginated",
        // Take up the whole width of the container
        width: '100%',
        // Use 600 pixels of height for now
        height,
    })

    // Get the promise that epubJS will display the start of the book
    const displayed = rendition.display()

    // Process the images after the book has been displayed
    displayed.then((stuff) => {
        // Load a bit more straight away
        stuff.next()
        // After the book has been loaded
        book.loaded.spine.then((spine) => {
            getAllImages(rendition).then((imgs) => {
                setImageList(imgs)
            })
        })
    })

    // Save the rendition to state
    setRendition(rendition)
}

/**
 * This retrieves a list of all the image assets that epubJS found in the e-book
 * and matches them to elements in the actual html content documents of the epub
 *
 * @param {EpubJS Rendition: http://epubjs.org/documentation/0.3/#rendition} rendition The rendition that epubJS makes that
 * @returns A list of ImageInfo objects for all the images found
 */
export async function getAllImages(rendition) {
    // All the different chapters / files in the book (I will call them items)
    const { spineItems } = rendition.book.spine

    // Map all the items asynchronously
    const mappedimages = spineItems.map(async (item) =>
        // Wait for epubJS to load that item
        item.load(rendition.book.load.bind(rendition.book)).then(() => {
            // The item has been loaded, so we can use it

            // Get the document from the item
            // (this isn't the same one that is eventually displayed, cus the image sources have to be replaced with different urls)
            const doc = item.document.documentElement

            // Get all img & image elements from the document
            const imgs = doc.querySelectorAll('img')
            const images = doc.querySelectorAll('image')

            // Concatenate the lists
            const allImages = [...imgs, ...images]
            // Map the images to their {src, section (book item), and element}
            return allImages.map((image) => {
                let src
                if (image.src) {
                    // If it's a normal image

                    // remove root url .replace(/^.*\/\/[^\/]+/, '').substring(1) // for taking out just the root of the url

                    // Take just the filename
                    src = String(image.src)
                        .split(/(\\|\/)/g)
                        .pop()
                } else if (image.href) {
                    // If it's a svg inside an <image> tag
                    // (i saw that used in the Alice in Wonderland epub)
                    src = image.href.baseVal
                }
                return { element: image, section: item, src }
            })
        })
    )

    // Await getting all the images asynchronously and flatten the array
    // (because there are multiple images per item in the book and multiple items in a book)
    const imageSectionList = await Promise.all(mappedimages).then((arr) =>
        arr.flat()
    )

    const bookPath = rendition.book.path.directory

    // Get the resources of the book (from the manifest)
    const resources = rendition.book.resources.replacementUrls.map((v, i) => ({
        replacementUrl: v,
        asset: {
            ...rendition.book.resources.assets[i],
            href: bookPath + rendition.book.resources.assets[i].href,
        },
    }))

    // Filter that list to only contain images (discard other types)
    const imageResources = resources.filter((resource) =>
        resource.asset.type.startsWith('image')
    )

    // Map each resource from the manifest to one of the imageSectionList above.
    let finalImageList = imageResources.map((imgResource) => {
        // Find image with the same filename as the one form the resource
        const foundImage = imageSectionList.find(
            (img) => imgResource.asset.href.split(/(\\|\/)/g).pop() === img.src
        )
        // If found
        if (foundImage) {
            return new ImageInfo(
                foundImage.element,
                foundImage.section,
                imgResource.asset,
                imgResource.replacementUrl
            )
        }
        // If not found
        return undefined
    })
    // Filter out images that weren't found
    // (this happens quite a lot in some books)
    // TODO: Research why some images aren't found!
    // Ideas: The image is a thumbnail, or just unused in the book.
    finalImageList = finalImageList.filter((n) => n !== undefined)

    return finalImageList
}

/**
 * This function finds an image in a HTMLDocument using the replacementUrl in the imageToFind object
 *
 * @param {HTMLDocument} contents the contents of a file in the epub in HTMLDocument format
 * @param {ImageInfo} imageToFind Information about the image to find
 * @returns The image element in the document if found, undefined if not found
 */
function findImageInDocument(contents, imageToFind) {
    const imgs = contents.querySelectorAll('img')
    const images = contents.querySelectorAll('image')

    const allImages = [...imgs, ...images]

    const foundImage = allImages.find((img) => {
        if (img.src) {
            return img.src === imageToFind.replacementUrl
        }
        if (img.href) {
            return img.href.baseVal === imageToFind.replacementUrl
        }
        return false
    })

    if (foundImage) {
        return foundImage
    }
    return undefined
}

/**
 * This returns the image element in the rendition
 * by displaying the image's corresponding section
 * and finding it in the contents of that section
 *
 * @param {ImageInfo} imagetobeDisplayed Information about the image to be displayed
 * @param {EpubJS rendition http://epubjs.org/documentation/0.3/#rendition} rendition The rendition containing all the information EpubJS generates
 * @returns Promise that resolves to the image element that is displayed
 */
export function getImageFromRendition(imagetobeDisplayed, rendition) {
    // Display the section in which the image is located
    const displayed = rendition.display(imagetobeDisplayed.section.href)

    // When that's done
    return displayed.then((sec) => {
        // Get array of html documents that are currently being rendered
        const contents = rendition.getContents()

        // Try to find the image in every document
        for (const doc of contents) {
            const found = findImageInDocument(doc.document, imagetobeDisplayed)
            if (found) {
                return found
            }
        }
        return null
    })
}

/**
 * The style object which is appliead to a highlighted element
 */
const highlightedStyle = {
    outline: '7px solid rgba(0, 255, 0, 0.8)',
    'box-shadow': '0 0 10px 10px rgba(0, 255, 0, 0.8)',
    transition: 'all 0.3s ease',
}

// Helper to apply the css
function css(el, style) {
    const element = el
    const prevStyle = {}
    for (const property in style) {
        if (Object.prototype.hasOwnProperty.call(style, property)) {
            prevStyle[property] = element.style[property]
            element.style[property] = style[property]
        }
    }
    return prevStyle
}

/**
 * Puts a red outline around an element for 5 seconds,
 * then returns the style back to what it was before.
 *
 * @param {HTMLElement} el The HTML Element to highlight
 */
export function highlightElement(el) {
    const element = el
    if (!element.style) {
        element.style = {}
    }
    if (!element.dataset) {
        element.dataset = {}
    } else if (element.dataset.highlighted === 'true') {
        // to prevent re-highlighting, which makes the element stay highlighted forever
        return
    }
    element.dataset.highlighted = true
    const prevStyle = css(element, highlightedStyle)
    // Reset to previous in 5 seconds
    setTimeout(() => {
        css(element, prevStyle)
        element.dataset.highlighted = false
    }, 5000)
}
