# frozen_string_literal: true

module Routes
  # GET /
  module Root
    def self.registered(app)
      app.get "/" do
        json(message: "Hello from Sinatra on Light Cloud")
      end
    end
  end
end
