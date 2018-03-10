var R = require ("ramda");
var async = require ("async");


// Paginates a function
// 1st Parameter: function to paginate. 
//     1. the function must have the first parameter the page number (starting with 1)
//     2. the function must return an array of data
// 2nd Parameter: length expected that indicates pages to follow
// Parameter in between: any data that stays the same during pagination
// Last Parameter: callback
function paginate( ) {
    var context = this;

    var args = R.values (arguments); // first argument is the function name
    var func = R.head(args); 
    var args_no_function = R.tail (args); // arguments
    var page_length = R.head(args_no_function);
    args_no_function = R.tail(args_no_function);
    var callback = args[args.length-1]; // the callback is the last arguement
    var args_func = R.take(args_no_function.length-1, args_no_function);
    //console.log("args_func: " , args_func);

    var page_number = 1;
    var data = [];

    var getPage = ( callback_page  ) => {
        var args_page = R.insert(0, page_number, args_func);
        //console.log ("arguments (with page) are: " , args_page);
        var args_call = R.append(callback_page, args_page);
        //console.log("arguments call is: ", args_call);
       
        //console.log(`calling get page ${page_number} ..`);
        func.apply(context, args_call);
    };
 
    // test function received the non error part of the callback of getPage
    var test = (data_page) => {
	// add the new received content to the data
        data = data.concat (data_page);
        page_number++;

        if (data_page.length<page_length) return false; // stop looping, when page length is less than 100.
        return true;       
    };

    var done = () => {
        callback (false, data);
    };

    async.doWhilst( getPage, test, done);
}

// EXPORT

module.exports.paginate = paginate;


// TEST

function demo (page, data, callback) {
    console.log(`downloading page ${page} with data ${data}..`);
    var args = R.values (arguments); 
    //console.log("arguments are: ", args); 

    if (page===1) callback (false, R.repeat('.', 5) );
    if (page===2) callback (false, R.repeat('#', 5) );
    if (page >=3) callback (false, [ "pretty", "much", "done"] );
}

function test () {
    paginate (demo, 5, "kikeriki", (err, list ) => {
        console.log("download finished! list downloaded: ", list);
    });
};

//test();