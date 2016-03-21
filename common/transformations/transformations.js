var SubjectField = require('../lib/SubjectField');
var url = require('../lib/url');

// Public methods
module.exports.resolveSubjectFields = resolveSubjectFields;

function resolveSubjectFields(dictEntries) {
	// return false if no results
	if (dictEntries.length === 0) return false;
	return dictEntries.map(function (dictEntry) {
		// resolve [12, 44] to ["example subjectField", "second ..."]
		var subjectFieldsAsStrings = SubjectField.toStrArr(dictEntry.subjectFields);
    // convert ["str", "str"] to [{ str, url}, {str, url}]
		var subjectFieldsWithURLs = url.encodeSlugArr(subjectFieldsAsStrings);
		var deUrl = url.encodeSlug(dictEntry.de);
		return {
			id: dictEntry.id,
			de: dictEntry.de,
			deUrl: deUrl,
			nl: dictEntry.nl,
			note: dictEntry.note || '',
			subjectFields: subjectFieldsWithURLs
		};
	});
};
