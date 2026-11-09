from rest_framework import serializers

from .models import Item


class StrictCharField(serializers.CharField):
    """A CharField that rejects numbers instead of turning them into text."""

    def to_internal_value(self, data):
        if not isinstance(data, str):
            self.fail("invalid")
        return super().to_internal_value(data)


class ItemSerializer(serializers.ModelSerializer):
    name = StrictCharField(max_length=200)
    # default=None: a PUT without description clears it, like every other field.
    description = StrictCharField(allow_null=True, allow_blank=True, default=None)

    class Meta:
        model = Item
        fields = ["id", "name", "description", "created_at", "updated_at"]
