import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import styles from './Annotator.module.scss'
import { classifyImageApiCall } from '../../api/ClassifyImage'
import { ImageInfo } from '../../helpers/EditorHelper'
import {
    getImgFilename,
    getLocation,
    getRawContext,
} from '../../helpers/EditImageHelper'

/**
 * The AI annotator component is in charge of classifying the image
 * and querying the server for a black-box AI description for it
 * @param {{currImage: ImageInfo}} props metadata for the image
 *  Note that changing of the image is propagated to this child
 * @param {{ebookId: The UUID for the ebook generated by server}} props
 * @param {{setImageId: SetStateAction}} props Updates image id stored on client, generated by server
 * @param {{currClassification: String}} props Classification for this image stored on server
 * @param {{setStage: SetStateAction}} props Sets the current stage in annotation processA 
 * @returns The Classifier component
 */
function Classifier({ currImage, ebookId, setImageId, currClassification, setStage }) {
    // TODO: switch to AI generation view --> show textArea instead of dropdown menu

    // TODO: split into Classification and AIAnnotator components

    // TODO: allow user to change classification later again, after AI generation

    // References/hooks to React DOM elements
    const saveButtonRef = useRef(null)
    const dropdownRef = useRef(null)

    // Creates a hook that executes the arrow func. every time imageSelected changes
    // TODO: also hide button for User annotation after saving

    // Creates a hook that executes the arrow func. every time imageSelected or classification changes
    useEffect(() => {
        if (!currImage) {
            saveButtonRef.current.disabled = true
            saveButtonRef.current.innerText = 'Select image first'
            
        } else {
            saveButtonRef.current.disabled = false
            saveButtonRef.current.innerText = 'Save classification'

            if (currClassification != null) {
                saveButtonRef.current.disabled = true
                // Show the selected classification
                const idx = options.findIndex(opt => opt.val === currClassification) + 1;
                dropdownRef.current.selectedIndex = idx;
            } else {
                // Show the label
                dropdownRef.current.selectedIndex = 0
            }
        }
    }, [currImage, currClassification])

    /**
     * @returns the currently selected classification
     */
    function getClassification() {
        if (currImage) {
            const choice =
                dropdownRef.current.options[dropdownRef.current.selectedIndex]
                    .value
            if (choice === 'Decoration') {
                // TODO: for now this is only an alert, but this may be changed still
                window.alert(
                    'Decorative images should not be annotated, please proceed to next image.'
                )
            }
            if (dropdownRef.current.selectedIndex === 0) {
                window.alert('This option is not allowed!')
                return 'Invalid'
            }
        return choice
    }
    }

    /**
     * Makes API call to server and disables "Save" button
     */
    function handleSubmit() {
        if (currImage) {
            // When only the client is run during development, we still want to inspect this function though
            if (!ebookId) {
                console.log('No e-book UUID stored on client!')
            }
            const selectedClassification = getClassification()
            classifyImageApiCall(
                ebookId,
                getImgFilename(currImage),
                getLocation(currImage),
                selectedClassification,
                getRawContext(currImage)
            ).then((result) => {
                // console.log(JSON.stringify(result));
                // Keep image id up to date after classifying
                if (Object.prototype.hasOwnProperty.call(result, 'id')) {
                    console.log('Image id of (new) entry: ' + result.id)
                    setImageId(result.id)
                }
            })

            if (selectedClassification !== 'Invalid') {
                saveButtonRef.current.disabled = true
                saveButtonRef.current.innerText = 'Classification Saved'
            } else {
                saveButtonRef.current.disabled = false
            }

            // For decorative images, user will not proceed to next stage
            if (selectedClassification !== 'Decoration' && selectedClassification !== 'Invalid') {
                setStage('ai-selection') 
            } 
        }
    }

    const options = [
        {abr: 'DECO', val: 'Decoration'},
        {abr: 'INFO', val: 'Information'},
        {abr: 'PHOTO', val: 'Photo'},
        {abr: 'ILLUS', val: 'Illustration'},
        {abr: 'FIG', val: 'Figure'},
        {abr: 'SYM', val: 'Symbol'},
        {abr: 'DRAW', val: 'Drawing'},
        {abr: 'COM', val: 'Comic'},
        {abr: 'LOGO', val: 'Logo'},
        {abr: 'GRAPH', val: 'Graph'},
        {abr: 'MAP', val: 'Map'},
    ]

    return (
        <div className={styles.ai_input}>

            <label htmlFor="selectClass">
                Please classify your selected image
            </label>
            <select
                name="selectedClass"
                id="selectClass"
                ref={dropdownRef}
                className={styles.dropdown}
                onClick={() => {
                    saveButtonRef.current.disabled = false
                }}>
                <option value="none" selected disabled hidden>
                    Classify image
                </option>
                {options.map((opt) => (
                    <option value={opt.val}> {opt.val} </option>
                    // handleMenuOption(ospt)
                ))}
            </select>
            <button
                type="button"
                className={styles.save_button}
                ref={saveButtonRef}
                onClick={() => handleSubmit()}>
                {' '}
                Save classification{' '}
            </button>
        </div>
    )
}

Classifier.propTypes = {
    currImage: PropTypes.instanceOf(ImageInfo).isRequired,
    ebookId: PropTypes.string.isRequired,
    setImageId: PropTypes.func.isRequired,
    currClassification: PropTypes.string.isRequired,
    setStage: PropTypes.func.isRequired,
}

export default Classifier
