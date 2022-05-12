from .serializers import AnnotationSerializer
from .models import Annotation
from .utils import check_request_body
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status


@csrf_exempt
def annotation_generation_view(request):
    if request.method == "PUT":
        body = check_request_body(request)
        if type(body) == JsonResponse:
            return body
        image = body[0]
        # data = body[1]
        # TODO: Retrieve the actual image from the storage system using information from data
        # TODO: Send request to the AI API
        # Create utils methods for those ^^
        # image_content = ...
        # response = ...
        annotation = Annotation.objects.create(image=image,
                                               type="BB",
                                               text="REPLACE WITH AI ANNOTATION")
        serializer = AnnotationSerializer(annotation)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)
    else:
        return JsonResponse({'msg': 'Method Not Allowed!'},
                            status=status.HTTP_405_METHOD_NOT_ALLOWED)


@csrf_exempt
def annotation_save_view(request):
    if request.method == "POST":
        body = check_request_body(request)
        if type(body) == JsonResponse:
            return body
        image = body[0]
        data = body[1]
        try:
            # Check if a human annotation already exists
            annotation = Annotation.objects.filter(image=image, type="HUM").get()
        except Annotation.DoesNotExist:
            annotation = Annotation.objects.create(image=image, type="HUM")
        annotation.text = data["text"]
        annotation.save()
        serializer = AnnotationSerializer(annotation)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)
    else:
        return JsonResponse({'msg': 'Method Not Allowed!'},
                            status=status.HTTP_405_METHOD_NOT_ALLOWED)
