from unittest import mock

from django.db import OperationalError, connection
from django.test import SimpleTestCase, TestCase


class IndexAndHealthTests(TestCase):
    def test_index_lists_routes(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("GET /health", response.json()["routes"])

    def test_health_ok(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_health_503_when_database_is_down(self):
        with mock.patch.object(connection, "cursor", side_effect=OperationalError("down")):
            response = self.client.get("/health")
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json(), {"error": "Database unavailable"})


class NotFoundTests(SimpleTestCase):
    def test_unknown_route_is_json_404(self):
        response = self.client.get("/nope")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"error": "Not found"})
