var controller = {
  fn: {
    videoId: function() {
      return this.uri.substr(8);
    },
    nameTrunc: function() {
      return this.name.substr(0, 25) + "..."
    }
  },
  resources: {
    videos: {
      url:"https://api.vimeo.com/tags/fun/videos?per_page=20",
      dataKey: "data",
      headers: {
        Authorization: 'bearer 34210aeac4e02a251b8821a53620e93c',
        Accept: 'application/vnd.vimeo.*+json;version=3.0'
      }
    }
  }
}

$(function() {
  new Reuq(controller);
})
