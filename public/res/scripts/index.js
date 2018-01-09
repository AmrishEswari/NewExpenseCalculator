var calculate = {};
var totalExpenses = 0;
var noofPersons = 0;
var singleExpenses = 0;
var expenseDetails = {};
var individualexpenseDetails = {};
var individualexpenseDetailsArr = [];
var selectedMenu = '';
var individualexpenseDetails_test = {};
var individualexpenseDetails_test_arr = [];
var getMonthName = '';
var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
var mongoLabURL ='tranquil-lake-83247.herokuapp.com';
var mongodbURL = 'localhost:3000';
var serverEnvironment = false;
var dbConnection = '';
var userInformation = {};
$(document).ready(function () {

    if (serverEnvironment) {
        dbConnection = mongoLabURL;
    }
    else {
        dbConnection = mongodbURL;
    }

    $('body').on('click', '#signin', function (e) {
        e.preventDefault();
        userInformation.username = $("#username").val();
        userInformation.password = $("#password").val();
        ValidateUsers(userInformation);
    });

    $('body').on('click','#submit', function (e) {
        e.preventDefault();        
        calculateTotalExpenses();        
        $("#totalexpenses").val(totalExpenses); 
        singleExpenses=calculateIndividualExpenses();   
    });

    $("body").on("click","#inserttodb" ,function (e) {
        e.preventDefault();
        saveRecordstoDatabase(expenseDetails);
        saveindividualExpensestoDatabase();
    });    

  

    $("body").on("click", ".navbar-nav li a", function (e) {       
        $(".navbar-nav li").each(function (item, value) {
            if ($(value).children().attr('id') === e.currentTarget.id) {
                $(value).addClass('active');
                var id = $(value).children().attr('id') + 'content';
                $("#" + id).parent().removeClass('hide');
                if (e.currentTarget.id === "expensehistory") {
                    getRecordsfromDatabase();
                }
                if (e.currentTarget.id === "individualexphistory") {
                    if (!getMonthName) {
                        var currentMonth = new Date();
                        getMonthName = monthNames[currentMonth.getMonth()] + '-' + currentMonth.getFullYear();
                    }
                    getIndividualExpenseDetails(getMonthName);                    
                }                
            }
            else {
                $(value).removeClass('active');
                var id = $(value).children().attr('id') + 'content';
                $("#" + id).parent().addClass('hide');
            }
        })    
    });

    

    function saveindividualExpensestoDatabase() {       
        $.ajax({
            type: 'POST',
            url: 'http://'+ dbConnection +'/insertindividualExpense',
            data: individualexpenseDetails_test,
            success: function (response) {
                if (response.code == 200) {
                    $("#alertMessage").removeClass('hide');
                    $("#alertMessage").html("Successfully added");
                }
            }
        })
    }

    function calculateTotalExpenses() {
        totalExpenses = 0;
        $(".form-control-calculate").each(function (item, value) {
            totalExpenses += Number(value.value);
            expenseDetails[value.id] = Number(value.value);
        });
        var getyearandmonth = new Date();
        expenseDetails["noofpersons"] = $("#noofpersons").val();
        expenseDetails["monthandyear"] = monthNames[getyearandmonth.getMonth()] + '-' + getyearandmonth.getFullYear();
        return totalExpenses;
    }

    function calculateIndividualExpenses() {
        noofPersons = Number($("#noofpersons").val());
        singleExpenses = Math.round((totalExpenses / noofPersons).toFixed(2));
        return singleExpenses;
    }

    function saveRecordstoDatabase() {
        $.ajax({
            type: 'POST',           
            url: 'http://'+ dbConnection +'/insertRecords',
            data: expenseDetails,
            success: function (response) {
                if (response.code === 200) {
                }
            },
            error: function (response) {

            }
        });
    }
    
    function getRecordsfromDatabase() {
        $.ajax({
            type: 'GET',            
            url: 'http://'+dbConnection+'/getRecords',
            success: function (response) {
                if (response.code === 200) {
                    buildExpenseHistory(response.data);
                    $("#alertMessage").addClass('hide');
                    $("#alertMessage").html(" ");
                }
            },
        })
    };

    function getIndividualExpenseDetails(getMonth) {
        $.ajax({
            type: 'GET',
            url: 'http://'+ dbConnection +'/getindividualExpense/' + getMonth,
            success: function (response) {
                if (response.code === 200) {
                    buildIndividualExpenseHistory(response.data);
                    $("#alertMessage").addClass('hide');
                    $("#alertMessage").html(" ");
                }
            }
        })
    }


    function buildExpenseHistory(response) {
        if (response) {
            var html = '';
            html += '<table class="table table-bordered">';
            html += '<tr><th>Month/Year</th><th>Number of Persons</th><th>Grocerry</th><th>Common Expense</th><th>Cook Salary</th><th>Internet</th><th>Opposite Shop</th><th>Room Rent</th></tr>';
            response.forEach(function (data, index) {
                html += '<tr><td> ' + data.monthandyear + '</td> ';
                html += '<td> ' + data.noofpersons + '</td> ';
                html += '<td>' + data.grocerry + '</td>';
                html += '<td>' + data.commonexpenses + '</td>';
                html += '<td>' + data.cooksalary + '</td>';
                html += '<td>' + data.internet + '</td>';
                html += '<td>' + data.oppshop + '</td>';
                html += '<td>' + data.roomrent + '</td></tr>';

            });
            html += "</table>";
            $("#expensehistorycontent").html(" ");
            $("#expensehistorycontent").append(html);
        }
        else {
            $("#expensehistorycontent").html(" ");
            $("#expensehistorycontent").append("<div class='alert alert-danger'>No Records found</div>");
        }
    }

    function buildIndividualExpenseHistory(response) {
        if (response) {
            var html = '';
            html += '<table class="table table-bordered">';
            html += '<tr><th>Month/Year</th><th>Name</th><th>Individual Share</th><th>Common Expense</th><th>Share to be given</th></tr>';
            response.individualexpensedetails.forEach(function (data, index) {
                html += '<tr><td> ' + data.monthandyear + '</td> ';
                html += '<td> ' + data.name + '</td> ';
                html += '<td> ' + data.singleexpenses + '</td> ';
                html += '<td>' + data.commonexpense + '</td>';
                html += '<td>' + data.amounttogiven + '</td></tr > ';
            });
            html += "</table>";
            $("#individualexphistorycontent").html(" ");
            $("#individualexphistorycontent").append(html);
        }
         else {
            $("#individualexphistorycontent").html(" ");
            $("#individualexphistorycontent").append("<div class='alert alert-danger'>No Records found</div>");
        }
    }

    $("body").on("click", "#generateindividualExpenseDetails", function (e) {
        e.preventDefault();
        var expenseDetails = {};
        expenseDetails.name = $("#username").val();
        expenseDetails.commonexpense = Number($("#commonexpenseamount").val());
        expenseDetails.amount = Math.round(Number(singleExpenses - expenseDetails.commonexpense).toFixed(2));
        if (expenseDetails) {
            buildExpenseForm(expenseDetails);
        }
    }); 

    function buildExpenseForm(expenseDetails) {  
            var getyearandmonth = new Date();
            var expenserow = '';    
            expenserow += '<tr><td id="username">' + expenseDetails.name + '</td><td id="singleexpense">' + singleExpenses + '</td><td id="commonexpense">' + expenseDetails.commonexpense + '</td><td id="remainingamount">' + expenseDetails.amount + '</td></tr>'
            individualexpenseDetails_test_arr.push( { "name": expenseDetails.name, "singleexpenses": singleExpenses, "commonexpense": expenseDetails.commonexpense, "amounttogiven": expenseDetails.amount, "monthandyear": monthNames[getyearandmonth.getMonth()] + '-' + getyearandmonth.getFullYear()});
            $("#tblindividualExpense").append(expenserow);
            individualexpenseDetails_test["individualexpensedetails"]=individualexpenseDetails_test_arr;
    }

    $("body").on("click", "#submituserrecords", function (e) {
        e.preventDefault();
        $("#rowid").each(function (item, value) {
            $(value).children().each(function (item_fu,value_fu) {

            });
        })
    });

    $('#expenseMonthAndYear li').on('click', function (e) {
        var selectedMonth = this.innerText;
        getIndividualExpenseDetails(selectedMonth);        
    });

    function SendWhatsAppMessage() {
        var url = 'https://foo.chat-api.com/message?token=83763g87x';
        var data = {
            phone: '9789567568', // Receivers phone
            body: 'Hello, Andrew!', // Message
        };
        // Send a request
        $.ajax(url, {
            data: JSON.stringify(data),
            contentType: 'application/json',
            type: 'POST'
        });
    }


    function ValidateUsers(userInformation) {        
        $.ajax({
            type: 'GET',
            url: 'http://' + dbConnection + '/getUsers',
            data: userInformation,
            success: function (response) {
                if (response.code === 200) {
                    window.location.href = "http://"+ dbConnection +"/playGround";
                }
            }
        })
    }

})