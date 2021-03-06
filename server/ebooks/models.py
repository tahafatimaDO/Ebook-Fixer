from django.db import models


def epub_dir_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/{uuid}
    return '{0}/{1}'.format(str(instance.uuid), filename)


class Ebook(models.Model):
    uuid = models.CharField(primary_key=True, max_length=100, default="DEFAULT_UUID", unique=True)
    title = models.CharField(max_length=50, blank=True, default='DEFAULT_TITLE')
    # The files uploaded to FileField are not stored in the database
    # but in the filesystem (under MEDIA_ROOT/...)
    # FileField is created as a string field in the database (usually VARCHAR),
    # containing the reference to the actual file
    epub = models.FileField(upload_to=epub_dir_path)

    def __str__(self) -> str:
        return self.uuid
