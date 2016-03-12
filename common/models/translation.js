module.exports = function (Translation) {

	Translation.status = function (cb) {
		var TranslationCollection = Translation.dataSource.connector.collection('translation');
		TranslationCollection.find({
				$text: {
					$search: 'Anlage'
				}
			})
      .sort({ "_id": 1}).skip(0).limit(100)
			.toArray(
				function (err, count) {
					console.log(count);
          var response = count;
          cb(null, response);
				});

		// var currentDate = new Date();
		// var currentHour = currentDate.getHours();
		// var OPEN_HOUR = 6;
		// var CLOSE_HOUR = 20;
		// console.log('Current hour is ' + currentHour);
		// var response;
		// if (currentHour > OPEN_HOUR && currentHour < CLOSE_HOUR) {
		// 	response = 'We are open for business.';
		// } else {
		// 	response = 'Sorry, we are closed. Open daily from 6am to 8pm.';
		// }


	};

	Translation.remoteMethod(
		'status', {
			http: {
				path: '/textsearch',
				verb: 'get'
			},
			returns: {
				arg: 'status',
				type: 'string'
			}
		}
	);

};
