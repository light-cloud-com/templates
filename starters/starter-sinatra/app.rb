require "sinatra/base"

class App < Sinatra::Base
  get "/" do
    content_type :json
    '{"message":"Hello from Sinatra on Light Cloud"}'
  end
end
