from django.db import models

# Create your models here.
class Property(models.Model):
    title = models.CharField(max_length=200)  # Title of the property
    description = models.TextField()  # Description of the property
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Price of the property
    location = models.CharField(max_length=200)  # Location of the property
    is_for_sale = models.BooleanField(default=True)  # Indicates if the property is for sale
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp when the property was created

    def __str__(self):
        return self.title  # String representation of the property


