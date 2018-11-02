export const CafeInCityFilter = {
    methods: {
        processCafeInCityFilter(cafe, cityID) {
            /*
              Checks to see if the cafe has tea
            */
            return cafe.city_id === cityID;
        }
    }
};
