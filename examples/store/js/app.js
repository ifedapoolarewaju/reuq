var controller = {
  fn: {
    videoId: function() {
      return this.uri.substr(8);
    },
    nameTrunc: function() {
      return this.name.substr(0, 25) + "..."
    },
    toggleLoader: function(){
      this.updateLocal('loader', function(loader){
        loader.loading = !loader.loading;
        return loader;
      })
    }
  },
  locals: {
    loader: {
      data: {loading: true}
    }
  },
  resources: {
    videos: {
      url:"https://api.vimeo.com/tags/fun/videos?per_page=20",
      dataKey: "data",
      headers: {
        Authorization: 'bearer 34210aeac4e02a251b8821a53620e93c',
        Accept: 'application/vnd.vimeo.*+json;version=3.0'
      },
      subscribers: ['fn.toggleLoader']
    }
  }
}

$(function() {
  new Reuq(controller);
})
