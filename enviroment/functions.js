var Campground = require("../controllers/campgrounds/campground_model"),
	Constants  = require("./constants");

var functions = {};

functions.returnSanitizedInput = function(object){
    for(property in object){
        if(object[property]){
            if(typeof object[property] == String){
                object[property] = req.sanitize(object[property]);
            }
        }           
    }
    return object;
}

functions.escapeRegex = function(text){
    return text.replace(/[-[\]{}()*+?.,\\^$!#\s]/g, "\\$&");
}

// GAVE UP ON THIS IDEA FOR NOW - LEAVING IT FOR FUTURE REFERENCE
// // FUNCTION TO CREATE CUSTOM COMPARE FUNCTION, BASED ON OBJECT'S FIELD
// functions.sortBy = function(field, type){
//     // if type == ascending
//     if(type === 1){
//         return function(a, b){
//             if(a[field] < b[field]){
//                 return -1;
//             } else if(a[field] > b[field]){
//                 return 1;
//             }
//             return 0;
//         }
//     } 
//     // if type == descending
//     else if(type === -1){
//         return function(a, b){
//             if(a[field] > b[field]){
//                 return -1;
//             } else if(a[field] < b[field]){
//                 return 1;
//             }
//             return 0;
//         }
//     }
// }

// GAVE UP ON THIS IDEA FOR NOW - LEAVING IT FOR FUTURE REFERENCE
// functions.mergeSearchResults = function(arr1, arr2, field){
//     var resultArr = [];
//     var campgroundsIds = [];
//     arr1.forEach(el => {
//         if(!campgroundsIds.includes(el._id)){
//             resultArr.push(el);
//             campgorundsIds.push(el._id);
//         }
//     });
//     arr2.forEach(el => {
//         if(!campgroundsIds.includes(el._id)){
//             resultArr.push(el);
//             campgorundsIds.push(el._id);
//         }
//     });
//     return resultArr.sort(functions.sortBy(field));
// }

module.exports = functions;