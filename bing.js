// Bing Custom Search API V7 DEMO
// By Tom Gao 1/24/2018

$(document).ready(function () {
    hideControls();
});

function hideControls() {
    $('#idBing').hide();
    $('#loader').hide();
    $('#idResultsAllSolo').hide();
    $('#idResultsProductsSolo').hide();
    $('#idResultsArticlesSolo').hide();
    $('#idResultsDownloadsSolo').hide();
    $('#idResultsProductSumm').hide();
    $('#idResultsArticlesSumm').hide();
    $('#idResultsDownloadsSumm').hide();
}

//Main API Call function
function callBing(str, count, offset, config, filter) {
    var estimated = 0;
    var total = 0;
    var summary = '';
    var results = '';
    var urlTypes = '';
    if (filter == null || filter == '') {
        filter = 'View all';
    }

    var params = {
        // Request parameters
        "q": str,
        "count": count,
        "offset": offset,
        "customconfig": config,
        "safesearch": "Moderate",
    };
    $.ajax({
        url: "https://api.cognitive.microsoft.com/bingcustomsearch/v7.0/search?" + $.param(params),
        beforeSend: function (xhrObj) {
            // Request headers
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "b2379c539ced45d2a130046a401b30ee"); //replace value with your own key
            $('#loader').show();
        },
        complete: function () {
            $('#loader').hide();
        },
        type: "GET",
    })
        .done(function (data) {
            $('#idHomeContent').hide();
            $('#idBing').show();

            //Nada found
            if (!$.trim(data.webPages)) {
                $('#idDetails').html("No results found.");
                $('#idFilters').html("");
                $('#idPaging').html("");
                $('#idResults').html("");
                return null;
            }

            var estimatedTotal = data.webPages.totalEstimatedMatches;
            len = data.webPages.value.length
            urlTypes = "View all,";
            for (i = 0; i < len; i++) {
                total += 1;
                var line = ''

                if (urlTypes.indexOf(resultType(data.webPages.value[i].url)) < 0) {
                    urlTypes += resultType(data.webPages.value[i].url) + ",";
                }

                //MAIN SEARCH RESULT LINE ITEM HTML
                line = "<p><table style='margin-bottom: 20px; margin-top: 20px; padding-left:1em; padding-top: 20px; padding-bottom: 20px; position: relative; border-bottom: 1pt solid rgba(0, 0, 0, 0.03); position: relative; display: block;'><tr><td><span style='font-weight:bolder; font-size: 20px'><a href='"
                    + data.webPages.value[i].url + "'>"
                    + nameClean(data.webPages.value[i].name) +
                    "</a></span></td><td><span style='font-size: 20px; font-weight:bolder; position: absolute; right:0; padding-right:1em'>"
                    + resultType(data.webPages.value[i].url)
                    + "</span></td></tr><tr><td colspan=2><span style='color: #328644'>"
                    + data.webPages.value[i].url + "</span></td></tr><tr><td colspan=2 style='font-size: 15px;'>"
                    + getLit(str, data.webPages.value[i].snippet) + "</td></tr></table></p>";

                if (filter != 'View all') {
                    if (resultType(data.webPages.value[i].url) == filter) {
                        results += line;
                    }
                } else {
                    results += line;
                }
                if (i < 5) {
                    summary += line;
                }
            }
            var currPage = (offset / count) + 1;
            var maxPage = Math.floor(estimatedTotal / count);
            if ((estimatedTotal % count) > 0) {
                maxPage++;
            }

            if (maxPage > 10) {
                maxPage = 10;
            }
            var pagingHtml = '';
            var next = "&nbsp;&nbsp;&nbsp;&nbsp;<a href=# onclick='page(" + count + ", " + (currPage * count) + ");'>Next</a>";
            if (currPage == maxPage) {
                next = '';
            };
            
            for (i = 1; i <= maxPage; i++) {
                if (i == currPage) {
                    pagingHtml += "<span style='padding-left:.5em'>" + i + "</span> ";
                } else {
                    //PAGING HTML
                    pagingHtml += "<a style='padding-left:.5em' href=# onclick='page(" + count + "," + ((i * count) - count) + ");'>" + i + "</a> ";
                }
            }

            var details = '';
            if ((offset / count) > 0) {
                //DETAILS TEXT HTML
                details += "Page " + ((offset / count) + 1) + " of ";
            }
            details += "about " + estimatedTotal + " results";
            $('#idDetails').html(details);

            var types = urlTypes.split(",");
            var filtersHTML = '';
            types.forEach(function (a) {
                if (a != '') {
                    if (a == filter) {
                        //FILTERS *SELECTED HTML
                        filtersHTML += "<a class='btn-sm btn-primary active' href=# onclick='filter(" + count + "," + ((currPage * count) - count) + ",&quot;" + a + "&quot;);'>" + a + "</a> ";
                    } else {
                        //FILTERS HTML
                        filtersHTML += "<a class='btn-sm btn-secondary' href=# onclick='filter(" + count + "," + ((currPage * count) - count) + ",&quot;" + a + "&quot;);'>" + a + "</a> ";
                    }
                }
            });

            $('#idFilters').html(filtersHTML);
            $('#idPaging').html(pagingHtml + next);
            $('#idResults').html(results);

        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            alert(textStatus + " " + jqXHR.status + ": " + errorThrown);
        });
}

//hit highlight function
function getLit(str, source) {
    var r = str.split(" ");
    r.forEach(function (a) {
        //HIT HIGHLIGHT FOR SNIPPET HTML
        source = source.split(RegExp("\\b"+a+"\\b","i")).join("<span style='font-weight: bold; color: blue; background-color: yellow;'>"+a+"</span>");
    });
    return source;
}

//paging function
function page(count, offset) {
    $('#idResults').html('');
    callBing($('#idSearchStrHidden').val(), count, offset, $('#idConfig').val(), null);
}

//filter function
function filter(count, offset, type) {
    $('#idResults').html('');
    callBing($('#idSearchStrHidden').val(), count, offset, $('#idConfig').val(), type);
}

//clean the 'Extron' behind page names
function nameClean(nameRaw) {
    var nameCleaned = nameRaw;
    if (nameCleaned.substr(nameCleaned.length - 6).toLowerCase() == 'extron') {
        nameCleaned = nameCleaned.replace('| Extron','');
        nameCleaned = nameCleaned.replace('- Extron','');
    }
    if (nameCleaned.substr(nameCleaned.length - 18).toLowerCase() == 'extron electronics') {
        nameCleaned = nameCleaned.replace('- Extron Electronics','');        
    }
    if (nameCleaned.substr(nameCleaned.length - 10).toLowerCase() == 'extron.com') {
        nameCleaned = nameCleaned.replace('- extron.com','');        
    }     
    return nameCleaned;
}
//result type url parse function
function resultType(url) {
    var type = '';
    if (url.indexOf("/product/") > 0) {
        type = 'Products';
    }
    if (url.indexOf("/download/") > 0) {
        type = 'Downloads';
    }
    if (url.indexOf("/company/") > 0) {
        type = 'Company';
    }
    if (url.indexOf("/technology/") > 0) {
        type = 'Technology';
    }
    if (url.indexOf("/markets/") > 0) {
        type = 'Markets';
    }
    if (url.indexOf("/tools/") > 0) {
        type = 'Resources';
    }
    if (url.indexOf("/training/") > 0) {
        type = 'Training';
    }
    if (url.indexOf("/files/brochure/") > 0) {
        type = 'Brochure';
    }
    if (url.indexOf("/files/userman/") > 0) {
        type = 'User Manual';
    }
    if (url.indexOf("/files/catalog/") > 0) {
        type = 'Catalog';
    }
    if (url.indexOf("article.aspx") > 0) {
        type = 'Articles';
    }
    if (url.indexOf("jobdetail.aspx") > 0 || url.indexOf("employment.aspx") > 0) {
        type = 'Careers';
    }
    return type;
}

// Triggers
$('#idNewSearchBarBtm').on('keypress', function (e) {
    if (e.which === 13) {
        $('#idSearchStrHidden').val($('#idNewSearchBarBtm').val());
        $(this).attr("disabled", "disabled");
        callBing($('#idSearchStrHidden').val(), 10, 0, $('#idConfig').val(), null);
        $(this).removeAttr("disabled");
    }
});
$("#idNewSearchBarBtmBtn").click(function () {
        $('#idSearchStrHidden').val($('#idNewSearchBarBtm').val());
        $(this).attr("disabled", "disabled");
        callBing($('#idSearchStrHidden').val(), 10, 0, $('#idConfig').val(), null);
        $(this).removeAttr("disabled");
});
$('#idNewSearchBarTop').on('keypress', function (e) {
    if (e.which === 13) {
        $('#idSearchStrHidden').val($('#idNewSearchBarTop').val());
        $(this).attr("disabled", "disabled");
        callBing($('#idSearchStrHidden').val(), 10, 0, $('#idConfig').val(), null);
        $(this).removeAttr("disabled");
        $('#idNewSearchBarTop').val('');
        $('#idNewSearchBarBtm').val($('#idSearchStrHidden').val());
    }
});
$("#idNewSearchBarTopBtn").click(function () {
    $('#idSearchStrHidden').val($('#idNewSearchBarTop').val());
    $(this).attr("disabled", "disabled");
    callBing($('#idSearchStrHidden').val(), 10, 0, $('#idConfig').val(), null);
    $(this).removeAttr("disabled");
    $('#idNewSearchBarTop').val('');
    $('#idNewSearchBarBtm').val($('#idSearchStrHidden').val());

});
$('#idNewSearchBarTopMobile').on('keypress', function (e) {
    if (e.which === 13) {
        $('#idSearchStrHidden').val($('#idNewSearchBarTopMobile').val());
        $(this).attr("disabled", "disabled");
        callBing($('#idSearchStrHidden').val(), 10, 0, $('#idConfig').val(), null);
        $(this).removeAttr("disabled");
        $('#idSearchBarTopMobile').val('');
        $('#idNewSearchBarBtm').val($('#idSearchStrHidden').val());
    }
});
$("#idNewSearchBarTopBtnMobile").click(function () {
    $('#idSearchStrHidden').val($('#idNewSearchBarTopMobile').val());
    $(this).attr("disabled", "disabled");
    callBing($('#idSearchStrHidden').val(), 10, 0, $('#idConfig').val(), null);
    $(this).removeAttr("disabled");
    $('#idSearchBarTopMobile').val('');
    $('#idNewSearchBarBtm').val($('#idSearchStrHidden').val());
});