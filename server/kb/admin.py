from django.contrib import admin
from kb.models import Ebook, Image, Annotation, ImageAnnotated

# Register your models here.

admin.site.register(Ebook)
admin.site.register(Image)
admin.site.register(Annotation)
admin.site.register(ImageAnnotated)
