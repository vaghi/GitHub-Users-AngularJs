angular.module('app', [])
    .controller('githubController', ['$scope','$http', function($scope,$http) {

        $scope.reposLoaded = false;
        $scope.userLoaded = false;
        $scope.username = "";
        $scope.userData="";
        $scope.followers="";
        $scope.repos;
        $scope.hasData=false;

        $scope.getUserUrl = function(){
            if($scope.username.length >= 4){
                $http.get("https://api.github.com/search/users?q=" + $scope.username+"+type:user&per_page=10")
                    .success(function (data) {
                        if(data.items.length>0){
                            $scope.hasData=true;
                            $scope.userData = data.items;
                            for(var i = 0; i < $scope.userData.length; i++){
                                $scope.getFollowersFromUserUrl($scope.userData[i].login,i);
                            }
                        }
                    });
            }else{
                $scope.userData="";
                $scope.hasData=false;
            }
        };
        $scope.getFollowersFromUserUrl = function(username,position){
            $http.get("https://api.github.com/users/"+username+"/followers")
                .success(function (data) {
                    $scope.userData[position].followers = data;
                    console.log($scope.userData[position]);
                });
        };
        $scope.getReposFromUserUrl = function(name){
            $http.get("https://api.github.com/users/"+name+"/repos")
                .success(function (data) {
                    $scope.repos = data;
                    for(var i=0;i< $scope.repos.length;i++){
                        if($scope.repos[i].description.length <= 50 || $scope.repos[i].description == null){
                            $scope.repos[i].description = "";
                            $scope.getCommentsFromRepo($scope.repos[i].name,name,i)
                        }
                    }
                });
        };
        $scope.getCommentsFromRepo = function(repo,username,position){
            $http.get("https://api.github.com/repos/"+username+"/"+repo+"/commits")
                .success(function (data) {
                    $scope.repos[position].commits = data;
                });
        };
    }]);

