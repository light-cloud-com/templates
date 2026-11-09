# frozen_string_literal: true

require_relative "test_helper"

class ApplicationTest < Minitest::Test
  include Rack::Test::Methods

  def app
    Application
  end

  def test_root_returns_welcome_message
    get "/"

    assert_equal 200, last_response.status
    assert_equal "application/json", last_response.media_type
    assert_equal({ "message" => "Hello from Sinatra on Light Cloud" }, JSON.parse(last_response.body))
  end

  def test_unknown_route_is_json_404
    get "/nope"

    assert_equal 404, last_response.status
    assert_equal({ "error" => "Not Found" }, JSON.parse(last_response.body))
  end
end
