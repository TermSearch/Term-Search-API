module.exports = function (Translation) {

	Translation.textsearch = function (searchPhrase, limit, skip, next) {
		// Get direct access to MongodDB collection methods
		var TranslationCollection = Translation.dataSource.connector.collection('translation');
		// First get the count for the query
		TranslationCollection.find({
			$text: {
				$search: searchPhrase
			}
		}).count(function (err, count) {
			// Then get the results with limit + skip
			TranslationCollection.find({
					$text: {
						$search: searchPhrase
					}
				})
				.sort({
					"_id": 1
				}).skip(skip).limit(limit)
				.toArray(
					function (err, results) {
						// Return cb with results + count
						next(err, {
							totalResults: count,
							results: results
						});
					});
		});
	};

	Translation.remoteMethod(
		'textsearch', {
			description: 'FullText search',
			accepts: [
				{
					arg: 'searchPhrase',
					type: 'string',
					required: true,
					description: 'Phrase to search for'
				},
				{
					arg: 'limit',
					type: 'number',
					required: true,
					description: 'How many results to return'
				},
				{
					arg: 'skip',
					type: 'number',
					required: true,
					description: 'How many results to skip'
				}
        ],
			http: {
				path: '/textsearch',
				verb: 'get'
			},
			returns: {
				arg: 'results',
				type: 'object'
			}
		}
	);

};
