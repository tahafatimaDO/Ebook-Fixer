/**
 * makes a PUT request to classify an image in an existing/uploaded ebook
 * @param {String} ebook_uuid: UUID of ebook under edit, generated by server upon upload
 * @param {String} filename: filename of classified image
 * @param {String} location: HTML filename of image
 * @param {String} classification: classification selected for image
 * @param {String} raw_context: textual context of image
 *
 * @returns  response by server
 */
export function classifyImageApiCall(
    ebookUuid,
    filename,
    location,
    classification,
    rawContext
) {
    return (
        fetch(process.env.REACT_APP_API_URL + 'images/classify/', {
            method: 'PUT',
            body: JSON.stringify({
                "ebook": ebookUuid,
                "filename": filename,
                "location": location,
                "classification": classification,
                "raw_context": rawContext,
            }),
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        })
            // .then(res => res.text()) // for the raw data
            .then((res) => res.json()) // if it's in json format
            .then(
                (result) => {
                    console.log(result)
                    return result
                },
                // Error handling vvv
                (error) => {
                    window.alert(
                        'Image classification error! Please try again.'
                    )
                    console.log(error)
                    throw error
                }
            )
    )
}
