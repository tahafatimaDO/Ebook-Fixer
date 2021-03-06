import os
from bs4 import BeautifulSoup
import shutil
from zipfile import ZipFile
import subprocess
from pathlib import Path


def inject_image_annotations(ebook_uuid, images, annotations):
    """ Injects all human image annotations to their corresponding ALT-texts in the HTML files

        Args:
            ebook_uuid (String): uuid of ebook
            images (List[Image]): all images in that ebook
            annotations (List[Annotation]): all human annotations for the images
    """
    storage_path = f"test-books/{ebook_uuid}"
    for image in images:
        try:
            image_annotation = filter(lambda a: a.image == image, annotations).__next__()
        except StopIteration:
            pass
        else:
            try:
                html_file = image.location
                html_content = open(storage_path + html_file)
                data = BeautifulSoup(html_content, 'html.parser')
                images_in_html = data.find_all('img', src=True)
                for im in images_in_html:
                    basename = os.path.basename(image.filename)
                    if str(im['src']).endswith(basename):
                        im['alt'] = image_annotation.text

                with open(storage_path + html_file, "w") as file:
                    text = data.prettify()
                    text = add_indentation(text, 3)
                    file.write(text)
            except FileNotFoundError:
                pass


def add_indentation(text, indentation):
    """ Adds new spaces at the start of each new line in the text.

    Args:
        text (String): the text to which we should add indentation
        indentation (Int): the number of spaces to be added to each line

    Returns:
        Text: the text with indentation
    """
    sp = " " * indentation
    lsep = chr(10) if text.find(chr(13)) == -1 else chr(13) + chr(10)
    lines = text.split(lsep)
    for i in range(len(lines)):
        space_diff = len(lines[i]) - len(lines[i].lstrip())
        if space_diff:
            lines[i] = sp * space_diff + lines[i]
    return lsep.join(lines)


def zip_ebook(ebook_uuid):
    """ Assumes that there is an unzipped epub at test-books/
    Zips the ebook with that uuid and returns the path for the zipped epub

    Args:
        ebook_uuid (String): uuid of ebook to zip

    Returns:
        Path: path to zipped .epub file to download
    """
    path_name = f"test-books/{ebook_uuid}/"
    zipfile_name = shutil.make_archive(ebook_uuid, 'zip', path_name)
    path = Path(zipfile_name)
    path = path.rename(path.with_suffix('.epub'))
    return path


def extract_title(ebook_uuid):
    """ Looks for the container.exml file under test-books/{uuid}/META-INF
        and extracts the path to the root file from which we get the title

    Args:
        ebook_uuid (String): uuid of ebook to extract title of

    Returns:
        String: extracted title of ebook
    """
    filepath = f"test-books/{ebook_uuid}/" "META-INF/container.xml"
    with open(filepath, 'r') as file:
        content = BeautifulSoup(file, 'xml')
        opf_path = f"test-books/{ebook_uuid}/" + content.find('rootfile')["full-path"]
        with open(opf_path, 'r') as f:
            opf_content = BeautifulSoup(f, 'xml')
            title = opf_content.find('title').string
            return title


def unzip_ebook(ebook_uuid, ebook_filename):
    """ Assumes the zipped epub file is stored under MEDIA_ROOT/test-books/{uuid}/{filename}
    Unzips the epub file, now under MEDIA_ROOT/{uuid}
    Calls helper to extract epub title

    Args:
        ebook_uuid (String): uuid of ebook to unzip epub file for
        ebook_filename (String): name of .epub file

    Returns:
        String: extracted title of ebook
    """
    epub_path = f"test-books/{ebook_uuid}/{ebook_filename}"
    # Turns epub file into zip archive
    with ZipFile(epub_path, 'r') as zipped_epub:
        zipped_epub.extractall(f"test-books/{ebook_uuid}/")
        # Remove the original .epub file
        os.remove(epub_path)
    return extract_title(ebook_uuid)


def push_epub_folder_to_github(uuid, message):
    """ Push the folder of the contents of the book to
    the GitHub repository from server/wsgi.py

    Args:
        uuid (UUID): The uuid of the e-book
        message (string): The commit message
    """
    folder = f"test-books/{uuid}/"
    subprocess.run(["git", "add", folder])
    subprocess.run(["git", "commit", "--quiet", "-m", message])
    subprocess.run(["git", "pull", "--allow-unrelated-histories"])
    subprocess.run(["git", "push", "--quiet"])
