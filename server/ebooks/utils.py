from bs4 import BeautifulSoup
from pathlib import Path
import shutil


def inject_image_annotations(ebook_uuid, html_filenames, images, annotations):
    storage_path = f"test-books/{ebook_uuid}/OEBPS/"
    for image in images:
        try:
            image_annotation = filter(lambda a: a.image == image, annotations).__next__()
            html_file = filter(lambda h: h == image.location, html_filenames).__next__()
        except StopIteration:
            pass
        else:
            html_content = open(storage_path + html_file)
            data = BeautifulSoup(html_content, 'html.parser')
            images_in_html = data.find_all('img', src=True)
            for im in images_in_html:
                if im['src'] == image.filename:
                    im['alt'] = image_annotation.text

            with open(storage_path + html_file, "w") as file:
                file.write(str(data))


# Assumes that there is an unzipped epub at test-books/
# Zips the ebook with that uuid and returns the path for the zipped epub
def zip_ebook(ebook_uuid):
    path_name = f"test-books/{ebook_uuid}/"
    zipfile_name = shutil.make_archive(ebook_uuid, 'zip', path_name)
    path = Path(zipfile_name)
    path = path.rename(path.with_suffix('.epub'))
    return path
