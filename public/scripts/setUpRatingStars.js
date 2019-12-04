$(document).ready(() => {
    var starsActive = Array.from($(".stars-active"));
    if(starsActive.length > 0){
        starsActive.forEach(star => {
            $(`#${star.id}`).rateYo({
                maxValue: 5,
                starWidth: "15px",
                spacing: "6px",
                fullStar: true,
                onSet: function(rating, rateYoInstance){
                    var campgroundId = rateYoInstance["node"]["attributes"]["data-campground-id"]["value"];
                    const url = `/campgrounds/${campgroundId}/rate`;
                    $(this).rateYo("option", "readOnly", "true");
                    $.ajax({
                        type: 'PUT',
                        url: url,
                        data: {rating: rating},
                        success: function(data, textStatus, jqXHR){
                            // console.log(jqXHR);
                            // console.log(`${textStatus} -> ${data}`);
                            var ul = $(`#rating-ul-${campgroundId}`);
                            var li = $(`#rating-li-${campgroundId}`);
                            li.remove();
                            ul.append($(`
                                <li id='rating-li-${campgroundId}' class='list-group-item text-center py-1' style='min-height: 66px;'>
                                    <p class="mb-1" style="color: grey">Your rating:</p>
                                    <div id='stars-${campgroundId}' data-campground-id='${campgroundId}' data-rating='${rating}' class='stars-set mx-auto mt-1 mb-2'></div>
                                </li>
                            `).hide().fadeIn(1500));
                            var addedStars = $(`#stars-${campgroundId}`);
                            setTimeout(() => {
                                addedStars.rateYo({
                                    maxValue: 5,
                                    starWidth: "20px",
                                    spacing: "10px",
                                    rating: rating,
                                    readOnly: true
                                });
                            }, 500);
                            var pill = $(`#ratingPill-${campgroundId}`);
                            var pillPopover = $(`#ratingPillPopover-${campgroundId}`);
                            pill.attr("data-votesquantity", (parseInt(pill.data("votesquantity")) + 1));
                            pill.attr(`data-votes${rating}`, (parseInt(pill.data(`votes${rating}`)) + 1));
                            pill.attr("data-multipliedratingssum", (parseInt(pill.data("multipliedratingssum") + rating)));
                            pill.html(`<i class=\"fas fa-star\"></i> ${(parseInt(pill.data("multipliedratingssum")+rating)/parseInt(pill.data("votesquantity")+1)).toFixed(1)}`);
                            var a = parseInt(pill.data("votesquantity") + 1);
                            var b = parseInt(pill.data("multipliedratingssum") + rating);
                            pillPopover.attr("data-content", `
                                <p class='mt-1 mb-1'>
                                    <strong>
                                        Rating
                                    </strong> - 
                                    ${(b/a).toFixed(1)} based on ${a} ${a == 1 ? "vote" : "votes"}
                                </p>
                            `);
                        },
                        error: function(jqXHR, textStatus, errorThrown){
                            // console.log(jqXHR);
                            console.log(`${textStatus} -> ${errorThrown}`);
                        }
                    });
                }
            });
        });
    }
    
    var starsSet = Array.from($(".stars-set"));
    if(starsSet.length > 0){
        starsSet.forEach(star => {
            var star = $(`#${star.id}`);
            star.rateYo({
                maxValue: 5,
                starWidth: "15px",
                spacing: "6px",
                rating: star.data("rating"),
                readOnly: true
            });
        });
    }
})