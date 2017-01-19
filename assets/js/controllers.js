$(window).scroll(function() {
if ($(this).scrollTop() > 1){  
    $('header').addClass("sticky");
  }
  else{
    $('header').removeClass("sticky");
  }
});

angular.module("helloApp", ['ngAnimate'])
    .config(function($httpProvider) {
        var auth = window.btoa("a4c44a40a193f390debf9c1927550e59ea0a7219"); //Token generated --  Must change it to freely interact with GitHub API
        $httpProvider.defaults.headers.common['Authorization'] = 'Basic ' + auth;
    })
    .controller("UsersController", function($scope, $http) {

    	$(".tooltipCtrl").tooltip({
			/*position: "right",
			// a little tweaking of the position
			offset: [-2, 10],
			// use the built-in fadeIn/fadeOut effect
			effect: "fade",
			// custom opacity setting
			opacity: 0.5*/
      	});

      	var modal = document.getElementById('myPopUp');
		// Get the button that opens the modal
		var span = document.getElementsByClassName("close")[0];
		// When the user clicks on <span> (x), close the modal
		span.onclick = function() {
		    $("#myPopUp").fadeOut()
		    $("body").removeClass("modal-open")
		}
		// When the user clicks anywhere outside of the modal, close it
		window.onclick = function(event) {
		    if (event.target == modal)
		    {
		    	$("body").removeClass("modal-open")
		        $("#myPopUp").fadeOut()
		    }
		}

		$scope.showModalRepo = function(repoUrl){

			$("body").addClass("modal-open");
			$(".popup-content").addClass("loading");

			$scope.repoSearchKeyword = "";

			var modal = document.getElementById('myPopUp');
			var span = document.getElementsByClassName("close")[0];

			modal.style.display = "flex";

			$http.get(repoUrl).
                then(function(response) {
                    $scope.repos = response.data;
                    $scope.records = response.data.length;

                    for(var r = 0; r < response.data.length; r++) {

                        if($scope.repos[r].description && $scope.repos[r].description.length > 150)
                            $scope.repos[r].description = $scope.repos[r].description.substring(0,150) + "...";

                        $http.get(response.data[r].commits_url.replace('{/sha}',''), {params: {"index": r}})
                            .success(function (data, status, headers, config) {
                                var commits = data;
                                for(var c = 0; c < commits.length && c < 3; c++)
                                    $scope.repos[config.params.index]["commit_" + c] = commits[c];

                                if($scope.records == 1) {
                                    $(".popup-content").removeClass("loading");

                                    if( $(".repoTable").css('visibility') == 'hidden')
                                        $('.repoTable').css('visibility','visible').hide().fadeIn('slow');
                                }
                                else
                                    $scope.records -= 1;
                            }).error(function (data, status, headers, config) {
                                if($scope.records == 1) {
                                    $(".popup-content").removeClass("loading");

                                    if( $(".repoTable").css('visibility') == 'hidden')
                                        $('.repoTable').css('visibility','visible').hide().fadeIn('slow');
                                }
                                else
                                    $scope.records -= 1;
                        });
                    }
                });
        }
        
        $scope.searchUsers = function(){
            if(!$scope.searchKeyword)
            {
                if($("body").hasClass("loading"))
                    $("body").removeClass("loading");

                return false;
            }

            $("body").addClass("loading");

            $http.get("https://api.github.com/search/users?q=" + $scope.searchKeyword + "+type:user&per_page=10", {params: {"search": $scope.searchKeyword}})
            .then(function(response) {
                if(response.config.params.search != $scope.searchKeyword)
                    return false;

                var data = response.data;
                $scope.users = data.items;

                if(data.items.length === 0)
                {
                    $("body").removeClass("loading");
                    return true;
                }

                $scope.records = data.items.length;
                $scope.repos = [];

                for(var i in data.items) {
                    $http.get(data.items[i]["followers_url"] + "?&per_page=" + $scope.showFollowers, {params: {"index": i,"search": $scope.searchKeyword}}).then(
                        function(response) {

                            var search = response.config.params.search;
                            if(search != $scope.searchKeyword)
                                return false;

                            var followers = response.data;
                            var index = response.config.params.index;
                            $scope.users[index]["followers"] = followers;

                            if($scope.records == 1)
                                $("body").removeClass("loading");
                            else
                                $scope.records -= 1;
                        },
                        function(response) {
                            var search = response.config.params.search;
                            if(search != $scope.searchKeyword)
                                return false;

                            var index = response.config.params.index;
                            $scope.users[index]["followers"] = [];

                            if($scope.records == 1)
                                $("body").removeClass("loading");
                            else
                                $scope.records -= 1;
                        });
                }
            });

        };

        $scope.showTable = function() {
            if ($scope.searchKeyword)
                return true;
            else 
                return false;
        };
    });