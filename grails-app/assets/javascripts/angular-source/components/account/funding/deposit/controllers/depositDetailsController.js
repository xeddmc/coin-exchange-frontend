//=require angular-source/components/account/funding/deposit/deposit.module

'use strict';

angular.module('account.funding.deposit').controller('depositDetailsController', [
    '$scope', '$routeParams', '$location', '$window', '$filter', 'depositDetailsService',
    function ($scope, $routeParams, $location, $window, $filter, depositDetailsService) {
        var _errors = '';
        var currentCurrency = '';

        loadDepositDetails();

        function loadDepositDetails(){
            _errors = '';
            currentCurrency = $routeParams.currency;
            if(currentCurrency != null && currentCurrency != '' && currentCurrency != undefined){
                depositDetailsService.getDepositLimits({currency: currentCurrency})
                    .success(function (depositLimits) {
                        $scope.depositLimits = depositLimits;
                        $scope.depositLimitsLoaded = true;
                        if($scope.depositLimits != null){
                            depositDetailsService.getDepositAddresses({currency: currentCurrency})
                                .success(function (depositAddresses){
                                    assignDepositAddresses(depositAddresses)
                                }).error(function (){
                                    $scope.depositAddresses = [];
                                    $scope.depositAddressesLoaded = false;
                                });
                        }
                    }).error(function (errorMessage) {
                        $scope.depositLimits = null;
                        $scope.depositLimitsLoaded = false;
                        _errors = errorMessage;
                    });
            }
            else{
                log.error("No currency provided to get the limits for")
            }
        };

        function assignDepositAddresses(depositAddresses){
            $scope.depositAddresses = depositAddresses;
            $scope.depositAddressesLoaded = true;
            setPaginationParams();
            recalculateMinAndMax();
            filterCollection();
        }

        $scope.createNewDepositAddress = function(){
            _errors = '';
            depositDetailsService.createNewAddress({currency: currentCurrency})
                .success(function (depositAddress) {
                    assignDepositAddresses(depositAddress)
                })
                .error(function (errorMessage){
                    _errors = errorMessage;
                });
        };

        $scope.getErrors = function(){
            return _errors;
        };

        $scope.sort = {
            reverse: false
        };

        $scope.getSortingClass = function (columnName) {
            var className = 'sorting';

            if ($scope.sort.predicate === columnName) {
                $scope.sort.reverse ? className += '_asc' : className += '_desc';
            }

            return className;
        };

        $scope.setCurrency = function(path){
            $window.location = '#/account/funding/deposit';
        }

        $scope.updateSorting = function (columnName) {
            if ($scope.sort.predicate === columnName) {
                $scope.sort.reverse = !$scope.sort.reverse;
            } else {
                $scope.sort.predicate = columnName;
                $scope.sort.reverse = true;
            }

            $scope.depositAddresses = $filter('orderBy')($scope.depositAddresses, columnName, $scope.sort.reverse);
            setPaginationParams();
            recalculateMinAndMax();
            filterCollection();
        };

        //Sorting params
        function setPaginationParams() {
            $scope.currentPage = 1;
            $scope.maxSize = 1;
            $scope.totalItems = $scope.depositAddresses.length;
        }

        $scope.pageChanged = function () {
            recalculateMinAndMax();
            filterCollection();
        };

        function filterCollection() {
            $scope.filteredDepositAddresses = $scope.depositAddresses.slice($scope.currentMinIndex, $scope.currentMaxIndex);
        }

        function recalculateMinAndMax() {
            $scope.currentMinIndex = ($scope.currentPage - 1) * 10;
            $scope.currentMaxIndex = Math.min($scope.totalItems, $scope.currentPage * 10);
        }
    }]);
