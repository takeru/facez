require 'sinatra'
require 'json'
require "sinatra/json"

get '/peer/list.json' do
  peer_id = params[:peer_id]
  peer = {
    :peer_id     => peer_id,
    :created_at  => Time.now,
    :updated_at  => Time.now,
    :error_count => 0
  }
  @peer_list[peer_id] = peer

  json({:result=>'OK', :peers=>@peer_list.values})
end

delete '/peer/:id.json' do
  peer_id = params[:id]
  @peer_list.delete(peer_id)
  json(:result=>'OK', :peer_id=>peer_id)
end

FILENAME = './peer_list.dump'

before do
  begin
    @peer_list = open(FILENAME) do |f|
      JSON.parse(f.read)
    end
  rescue => e
    @peer_list = {}
  end
end

after do
  open(FILENAME, 'w') do |f|
    f.write(@peer_list.to_json)
  end
end
