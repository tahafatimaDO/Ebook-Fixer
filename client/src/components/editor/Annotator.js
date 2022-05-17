import { useEffect, useState, useRef} from 'react'
import PropTypes from 'prop-types'
import { ReactComponent as HistorySVG } from '../../assets/svgs/history-icon.svg'
import { ImageInfo } from '../../helpers/EditorHelper'
import AIannotator from './AIannotator'
import {saveUserAnnotation} from '../../api/AnnotateImage'
import {getImgFilename} from '../../helpers/EditImageHelper'
import { getImageMetadataApiCall } from '../../api/GetImageMetadata'
import styles from './Annotator.module.scss'

/**
 * The user Annotator component has a textbox with a button for the history of the annotations for that image.
 * It should receive the history of the annotations.
 * And a function to save the annotation somewhere once the user types it.
 *
 * @param {{annotationList: List of Strings}} props List of the annotations for this image
 * @param {{setTextValue: SetStateAction}} props Updates text value in user annotation box
 * @param {{textValue: String}} props Human annotation entered by user
 * @returns The UserAnnotator component
 */

function UserAnnotator({ annotationList, setTextValue, textValue }) {
    const [typing, setTyping] = useState(false)


    useEffect(() => {
        const list = annotationList
        if (list.length > 0) {
            // Display the latest human annotation
            setTextValue(list[list.length-1])
        }
        else { // No annotation (default/human)
            setTextValue("");
        }
    }, [annotationList])


    return (
        <div className={styles.user_input}>
            <textarea
                value={textValue}
                onChange={(e) => {
                    setTextValue(e.target.value)
                }}

                placeholder="Your annotation here..."
                onFocus={() => {
                    setTyping(true)
                }}
                onBlur={() => {
                    setTyping(false)
                }}
            />
            <button
                type="button"
                className={
                    styles.icon + ' ' + (typing ? styles.transparent : '')
                }>
                <HistorySVG title="Annotation History" />
            </button>
        </div>
    )
}

UserAnnotator.propTypes = {
    annotationList: PropTypes.arrayOf(PropTypes.string).isRequired,
    setTextValue: PropTypes.func.isRequired,
    textValue: PropTypes.string.isRequired,

}

/**
 * Annotator component is meant to help the user produce an annotation for an image as an end result
 * It has an AI component for classifying images and generating AI descriptions
 * And a user component for letting the user annotate images
 *
 * @param {{currImage: ImageInfo}} props metadata for image
 * @param {{ebookId: String}} props The UUID for the ebook generated by server
 * @returns Tha Annotator Component
 */

function Annotator({ currImage, ebookId }) {

    const [userAnnotationList, setUserAnnotationList] = useState([]);
    const [imageId, setImageId] = useState("");
    const [textValue, setTextValue] = useState("");

    const saveButton = useRef(null)
    // Executed every time the currentImage changes
    useEffect(() => {
        if (!currImage) {
            saveButton.current.innerText = "Select image first"
            saveButton.current.disabled=true
        } else {
            saveButton.current.innerText = "Save Annotation"
            saveButton.current.disabled=false
            // TODO: image must exist (classified!!) before calling the API
            getImageMetadataApiCall(ebookId, getImgFilename(currImage))
        }
        // TODO: display the previously stored annotation for each image! Should override the initial alt text
        // TODO: fetch HUM annotation for curr image from server + check for type HUM!

        const imgInfo = currImage
        if (imgInfo) {
            const altText = imgInfo.element.alt
            if (altText) {
                // Initial human annotation is the existing ALT-text
                setUserAnnotationList([altText])
            } else {
                // The image has no alt text
                // setUserAnnotationList([])
            }
        }
    }, [currImage])


    function handleClick() {
        saveUserAnnotation(ebookId,
                           imageId,
                           getImgFilename(currImage),
                           textValue)
        saveButton.current.innerText = "Annotation saved"
        saveButton.current.disabled = true

    }

    return (
        <div className={styles.container}>

            <AIannotator currImage={currImage} ebookId={ebookId} setImageId={setImageId}>
                {' '}
            </AIannotator>
            <UserAnnotator annotationList={userAnnotationList} setTextValue={setTextValue} textValue={textValue}/>
            <button type="button"
                    className={styles.save_button}
                    ref={saveButton}
                    onClick={() => handleClick()}>
                    Save Annotation

            </button>
        </div>
    )
}

Annotator.propTypes = {
    currImage: PropTypes.instanceOf(ImageInfo).isRequired,
    ebookId: PropTypes.string.isRequired,
}

export default Annotator
