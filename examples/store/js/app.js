var controller = {
  dynamicProperties: {
    videoId: function(data) {
      return data.uri.substr(8);
    },
    nameTrunc: function(data) {
      return data.name.substr(0, 25) + "...";
    }
  },
  resources: {
    videos: {
      url:"resources/videos.json",
      dataKey: "data"
    }
  }
}

$(function() {
  new Reuq(controller);
})
