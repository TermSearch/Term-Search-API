'use strict';

const SubjectField = require('../lib/SubjectField');
const dictEntryHelper = require('../helpers/dictEntryHelper');

module.exports = function (Dictentry) {

	// live search query optimised for speed, case sensitive
	Dictentry.liveSearch = function (term, subjectFields = false, limit = 10, skip = 0, cb) {

		const whereQuery = {
			de: {like: '^'+term }
		};

		console.time('Q: '+term+' - Subject: '+subjectFields);

		if (subjectFields) {
      // Convert the comma seperated string to an array of subjectField numbers
      const subjectFieldNrArr = SubjectField.toNrArr(subjectFields);
			// Map all subjectFields to AND query
			const andQuery = subjectFieldNrArr.map( nr => ({ subjectFields: nr }) );
			// Add to whereQuery
      whereQuery.and = andQuery;
    }

		// Build query
		const query = {
			where: whereQuery,
			order: 'de ASC',  	// sort de ascending
			limit: limit,
      skip: skip,
			fields: {
					'de': true // only return 'de' string
				}
		};

		Dictentry.find(query)
		  .then(dictentries => {
		    cb(null, {
		      dictentries
		    });
		  })
		  .then(() => {
		    // log query time
		    console.timeEnd('Q: ' + term + ' - Subject: ' + subjectFields);
		  });
	};

	Dictentry.startsWith = function (term, subjectFields = false, limit = 10, skip = 0, cb) {

    const regexQuery = new RegExp('^' + term, 'i');

		// Regex queries are not very fast, maybe someday use this for more speed?
		// or: [
		//   {de: {like: '^Test'}},
		//   {de: {like: '^test'}}
		//   ]

		const whereQuery = {
			de: regexQuery
		};

		console.time('Q: '+term+' - Subject: '+subjectFields);

		if (subjectFields) {
      // Convert the comma seperated string to an array of subjectField numbers
      const subjectFieldNrArr = SubjectField.toNrArr(subjectFields);
			// Map all subjectFields to AND query
			const andQuery = subjectFieldNrArr.map( nr => ({ subjectFields: nr }) );
			// Add to whereQuery
      whereQuery.and = andQuery;
    }

		// Build query
		const query = {
			where: whereQuery,
			order: 'de ASC',  	// sort de ascending
			limit: limit,
      skip: skip
		};

		// First do a count with only the whereQuery
		Dictentry.count(whereQuery)
			.then(count => {
				// Then execute the actual search query
				Dictentry.find(query)
					.then(dictEntryHelper.resolveSubjectFields)
					.then(dictentries => {
						cb(null, {
							count,
							dictentries
						});
					})
					.then( () => {
						// log query time
						console.timeEnd('Q: '+term+' - Subject: '+subjectFields);
					});
			});
	};

	Dictentry.remoteMethod(
		'startsWith', {
			description: 'Search terms starting with ...',
			accepts: [
				{
					arg: 'term',
					type: 'string',
					required: true,
					description: 'Term string to search for'
        },
				{
					arg: 'subjectFields',
					type: 'string',
					required: false,
					description: 'Subjectfield to search for'
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
				path: '/startsWith',
				verb: 'get'
			},
			returns: {
				arg: 'results',
				type: 'object'
			}
		}
	);

	Dictentry.remoteMethod(
		'liveSearch', {
			description: 'For live search calls ...',
			accepts: [
				{
					arg: 'term',
					type: 'string',
					required: true,
					description: 'Term string to search for'
				},
				{
					arg: 'subjectFields',
					type: 'string',
					required: false,
					description: 'Subjectfield to search for'
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
				path: '/liveSearch',
				verb: 'get'
			},
			returns: {
				arg: 'results',
				type: 'object'
			}
		}
	);
};
