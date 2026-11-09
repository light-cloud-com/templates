package server

import "github.com/gofiber/fiber/v2"

func index(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Hello from Fiber on Light Cloud"})
}

func health(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"status": "ok"})
}
