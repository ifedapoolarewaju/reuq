var controller = {
  callbacks: {
    renderSearch: function(data, status, form) {
      form[0].reset();
      this.render('searchedVideos', data.data);
    }
  },
  eventHandlers: {
    close: function(el) {
      el.parents('.media_list').remove();
    }
  },
  fn: {
    videoId: function() {
      return this.uri.substr(8);
    },
    nameTrunc: function() {
      return this.name.substr(0, 25) + "...";
    },
    searchFormHeaders: function() {
      return this.controller.resources.videos.headers;
    }
  },
  resources: {
    videos: {
      url:"https://api.vimeo.com/tags/fun/videos?per_page=10",
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
