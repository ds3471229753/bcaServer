let vm = new Vue({
    el: '#app',
    data: {
        coordinate: {},
    },
    created() {
        let _this = this;
        axios.get('/api/getCoordinate/', {params: {devicetype: 'BCA-1B'}})
            .then(res => {
                console.log(res.data);
                _this.coordinate = res.data;
            })
            .catch(err => console.error(err));
    },
    methods: {
        updateCoordinate() {
            let _this = this;
            axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
            Vue.prototype.$axios = axios;
            var params = new URLSearchParams();
            params = _this.coordinate;
            this.$axios({
                method: 'post',
                url: '/api/updateCoordinate/',
                data: params
            }).then(res => {
                console.log(res.data);
                if (res.data === 'OK') {
                    layer.alert('调整成功，请重新打印');
                }
            }).catch(err => console.error(err));
        },
        queryCoordinate(devicetype) {
            let _this = this;
            axios.get('/api/getCoordinate/', {params: {devicetype: devicetype}})
                .then(res => {
                    console.log(res.data);
                    _this.coordinate = res.data;
                })
                .catch(err => console.error(err));
        },
        goBack() {
            //window.location.href = '/result/';
        }
    }
});