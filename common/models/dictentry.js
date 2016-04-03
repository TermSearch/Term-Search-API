'use strict';

const SubjectField = require('../lib/SubjectField');
const transformations = require('../transformations/transformations');

module.exports = function (Dictentry) {

	Dictentry.startsWith = function (term, subjectFields, limit, skip, cb) {
		// Use ES6 default parameters for this as soon as available in Node 6
		subjectFields = subjectFields || false;

    const regexQuery = new RegExp('^' + term, 'i');

		// Regex queries are not very fast, maybe someday use this for more speed?
		// or: [
		//   {de: {like: '^Test'}},
		//   {de: {like: '^test'}}
		//   ]

		const whereQuery = {
			de: regexQuery
		}

		console.log('Search query: ' + term);

		if (subjectFields) {
      // Convert the comma seperated string to an array of subjectField numbers
      const subjectFieldNrArr = SubjectField.toNrArr(subjectFields);
			// Map all subjectFields to AND query
			const andQuery = subjectFieldNrArr.map( nr => ({ subjectFields: nr }) );
			// Add to whereQuery
      whereQuery.and = andQuery;
    }

		// Build total query
		const query = {
			where: whereQuery,
			limit: limit,
      skip: skip
		};

		// First do a count with only the whereQuery
		Dictentry.count(whereQuery)
			.then(count => {
				// Then execute the actual search query
				Dictentry.find(query)
					.then(transformations.resolveSubjectFields)
					.then(dictentries => {
						cb(null, {
							count,
							dictentries
						});
					})
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
};
