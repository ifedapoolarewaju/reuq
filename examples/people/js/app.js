var app = {
  dynamicProperties: {
    id: function(data) {
      return this.getLocal("people").indexOf(data)
    },
    fullName: function(data) {
      return data.firstName + " " + data.lastName;
    },
    isAdult: function(data) {
      return data.age >= 21;
    }
  },
  subscribers: {
    showCount: function(data) {
      $('.count').text("(" + data.length + ")")
    }
  },
  eventHandlers: {
    removeUser: function(evt, userIndex) {
      this.updateLocal("people", function(data) {
        data.splice(userIndex, 1);
        return data;
      })
    }
  },
  locals: {
    people: {
      data: [
        { firstName: "Ifedapo", lastName: "Olarewaju", male: true, age: 14 },
        { firstName: "Mike", lastName: "Raymond", male: false, age: 23 },
        { firstName: "Wale", lastName: "Trevor", male: true, age: 19 },
        { firstName: "Posner", lastName: "Simpson", male: false, age: 23 },
        { firstName: "Tunde", lastName: "Lauren", male: true, age: 10 },
        { firstName: "Taylor", lastName: "Ralph", male: true, age: 30 },
        { firstName: "Simon", lastName: "Michael", male: true, age: 11 },
        { firstName: "Quetnin", lastName: "Samuel", male: true, age: 17 },
        { firstName: "Terrantino", lastName: "Samson", male: true, age: 24 },
        { firstName: "Tunde", lastName: "Wattson", male: true, age: 22 }
      ],
      subscribers: ['showCount']
    }
  }
}

$(function() {
  new Reuq(app);
})
