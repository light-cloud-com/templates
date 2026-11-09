from django.test import TestCase

from .models import Item


class ItemApiTests(TestCase):
    def post(self, path, body):
        return self.client.post(path, body, content_type="application/json")

    def put(self, path, body):
        return self.client.put(path, body, content_type="application/json")

    def test_create_trims_name(self):
        response = self.post("/items", {"name": "  Test item  ", "description": "Hello"})
        self.assertEqual(response.status_code, 201)
        item = response.json()
        self.assertEqual(item["name"], "Test item")
        self.assertEqual(item["description"], "Hello")
        self.assertLessEqual({"id", "created_at", "updated_at"}, item.keys())

    def test_get_update_delete(self):
        item = Item.objects.create(name="One", description="d")
        self.assertEqual(self.client.get(f"/items/{item.id}").json()["name"], "One")

        response = self.put(f"/items/{item.id}", {"name": "Renamed"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["name"], "Renamed")
        self.assertIsNone(response.json()["description"])

        self.assertEqual(self.client.delete(f"/items/{item.id}").status_code, 204)
        self.assertEqual(self.client.get(f"/items/{item.id}").status_code, 404)
        self.assertEqual(self.client.delete(f"/items/{item.id}").status_code, 404)

    def test_list_pagination(self):
        items = Item.objects.bulk_create(Item(name=f"n{n}") for n in range(25))
        self.assertEqual(len(self.client.get("/items").json()), 20)
        page = self.client.get("/items?limit=2&offset=1").json()
        self.assertEqual([row["id"] for row in page], [items[1].id, items[2].id])
        self.assertEqual(len(self.client.get("/items?limit=100").json()), 25)

    def test_list_rejects_bad_paging(self):
        for query in ["limit=0", "limit=101", "offset=-1", "limit=abc"]:
            with self.subTest(query=query):
                response = self.client.get(f"/items?{query}")
                self.assertEqual(response.status_code, 400)
                self.assertIn("error", response.json())

    def test_create_rejects_invalid_body(self):
        for body in [{}, {"name": ""}, {"name": "   "}, {"name": "x" * 201}, {"name": 5}]:
            with self.subTest(body=body):
                response = self.post("/items", body)
                self.assertEqual(response.status_code, 400)
                self.assertEqual(list(response.json()), ["error"])

    def test_unknown_item_is_404(self):
        for path in ["/items/999999999", "/items/abc"]:
            with self.subTest(path=path):
                response = self.client.get(path)
                self.assertEqual(response.status_code, 404)
                self.assertIn("error", response.json())
