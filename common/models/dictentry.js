'use strict';

const SubjectField = require('../lib/SubjectField');
const transformations = require('../transformations/transformations');

module.exports = function (Dictentry) {

	Dictentry.startsWith = function (term, subjectFieldStr, limit, skip, cb) {
		
		// Use ES6 default parameters for this as soon as available in Node 6
		subjectFieldStr = subjectFieldStr || false;

    const regexQuery = new RegExp('^' + term, 'i');

		// Regex queries are not very fast, maybe someday use this for more speed?
		// or: [
		//   {de: {like: '^Test'}},
		//   {de: {like: '^test'}}
		//   ]

		const whereQuery = {
			de: regexQuery
		}

		if (subjectFieldStr) {
      // Convert the comma seperated string to an array of subjectField numbers
      const subjectFieldNrArr = SubjectField.toNrArr(subjectFieldStr);
      // inq = or --> returns elements with any of the subjectfields in the array
      whereQuery.subjectFields = {
				inq: subjectFieldNrArr
			}
    }

		const query = {
			where: whereQuery,
			limit: limit,
      skip: skip
		};

		Dictentry.count(whereQuery)
			.then(count => {
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
					arg: 'subjectFieldStr',
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
