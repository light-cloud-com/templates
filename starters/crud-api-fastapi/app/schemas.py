from typing import Annotated

from pydantic import BaseModel, StringConstraints


class ItemIn(BaseModel):
    name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
    description: str | None = None
