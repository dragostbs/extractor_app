from django.db import models


class File(models.Model):
    file = models.FileField(upload_to="uploaded_files")
    text = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.file.name
