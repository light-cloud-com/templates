# frozen_string_literal: true

require "sinatra/base"
require "json"

require_relative "routes/root"

# The Rack application: settings and helpers here, routes in app/routes/.
class Application < Sinatra::Base
  configure do
    set :show_exceptions, false
  end

  helpers do
    def json(data)
      content_type :json
      JSON.generate(data)
    end
  end

  not_found do
    json(error: "Not Found")
  end

  error do
    json(error: "Something went wrong")
  end

  register Routes::Root
end
