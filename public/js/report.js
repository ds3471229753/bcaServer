let vm = new Vue({
    el: '#report',
    data: {
        deviceType: '',//机型
        bgImage: {
            backgroundImage: '',
        },
        message: null,
        hides: [],
        //坐标设置
        btn: {},
        coordinate: {},
    },
    created: function () {
        let urllist = location.href.split('/');
        let url = "/api/" + urllist[4] + "/" + urllist[5] + "/" + urllist[6];
        console.log(url);
        let _this = this;
        let year = new Date().getFullYear();
        //用户设置偏移量
        let x_offset = y_offset = 0;
        if (location.search !== '') {
            let query = location.search.split('&');
            x_offset = parseFloat(query[0].split('=')[1]);
            y_offset = parseFloat(query[1].split('=')[1]);
        }

        axios.get(url).then(function (res) {
            _this.message = res.data;
            _this.message.birthyear = year - _this.message.birthyear;
            //查询坐标值 /api/getCoordinate/
            axios.get('/api/getCoordinate/', {params: {devicetype: _this.message.devicetype}})
                .then(res => {
                    _this.coordinate = res.data;
                    for (let key in _this.coordinate) {
                        if (_this.coordinate[key] !== null && key !== 'devicetype') {
                            _this.coordinate[key] = key.indexOf('_x') > -1 ? parseFloat(_this.coordinate[key]) + x_offset + 'mm' : parseFloat(_this.coordinate[key]) + y_offset + 'mm';
                            //_this.coordinate[key] = _this.coordinate[key] + 'mm';
                        }
                    }
                    //获取到数据和坐标之后才能开始渲染页面
                    if (_this.message.devicetype !== null) {
                        if (_this.message.devicetype.indexOf('1B') > -1) { //获取机型，显示背景图
                            _this.$options.methods.setCoordinate_1B();
                        } else if (_this.message.devicetype.indexOf('1C') > -1) {
                            _this.$options.methods.setCoordinate_1C();
                        } else if (_this.message.devicetype.indexOf('1D') > -1) {
                            _this.$options.methods.setCoordinate_1D();
                        }
                    }
                }).catch(err => console.error(err));
        }).catch(function (err) {
            console.log(err)
        });
    },
    mounted() {
        setTimeout(function () {
            window.print();
        }, 500);
    },
    methods: {
        coordinate() {
            let _this = vm;
            let place = _this.coordinate;
            _this.btn = {
                //基本信息
                name: {top: place.name_y, left: place.name_x},
                sex: {top: place.sex_y, left: place.sex_x},
                birthyear: {top: place.age_y, left: place.age_x},
                height: {top: place.height_y, left: place.height_x},
                testdate: {top: place.testdate_y, left: place.testdate_x},
                score: {top: place.score_y, left: place.score_x},
                body_age: {top: place.body_age_y, left: place.body_age_x},

                //体重管理
                standard_weight: {top: place.standard_weight_y, left: place.standard_weight_x},//目标体重
                weight_control: {top: place.weight_control_y, left: place.weight_control_x},//体重控制
                fat_control: {top: place.fat_control_y, left: place.fat_control_x},//脂肪控制
                muscle_control: {top: place.muscle_control_y, left: place.muscle_control_x},//肌肉控制

                //人体成分
                fat: {top: place.fat_y, left: place.fat_x},
                pbf: {top: place.pbf_y, left: place.pbf_x},
                fat_range: {top: place.fat_range_y, left: place.fat_range_x},
                bone: {top: place.bone_y, left: place.bone_x},
                bone_scale: {top: place.bone_scale_y, left: place.bone_scale_x},
                bone_range: {top: place.bone_range_y, left: place.bone_range_x},
                protein: {top: place.protein_y, left: place.protein_x},
                protein_scale: {top: place.protein_scale_y, left: place.protein_scale_x},
                protein_range: {top: place.protein_range_y, left: place.protein_range_x},
                water: {top: place.water_y, left: place.water_x},
                water_scale: {top: place.water_scale_y, left: place.water_scale_x},
                water_range: {top: place.water_range_y, left: place.water_range_x},
                icw: {top: place.icw_y, left: place.icw_x},//细胞内液
                ecw: {top: place.ecw_y, left: place.ecw_x},//细胞外液
                water_copy: {top: place.water_copy_y, left: place.water_copy_x},
                muscle: {top: place.muscle_y, left: place.muscle_x},
                lbm: {top: place.lbm_y, left: place.lbm_x},
                weight: {top: place.weight_y, left: place.weight_x},
                waterline: {top: place.waterline_y, left: place.waterline_x, border: '1mm solid black'},
                line_water: {top: place.line_water_y, left: place.line_water_x},
                fatline: {top: place.fatline_y, left: place.fatline_x, border: '1mm solid black'},
                line_fat: {top: place.line_fat_y, left: place.line_fat_x},
                proteinline: {top: place.proteinline_y, left: place.proteinline_x, border: '1mm solid black'},
                line_protein: {top: place.line_protein_y, left: place.line_protein_x},
                boneline: {top: place.boneline_y, left: place.boneline_x, border: '1mm solid black'},
                line_bone: {top: place.line_bone_y, left: place.line_bone_x},

                /*基本评估及分析 --> 划线部分*/
                //体重 weight
                weightline: {top: place.weightline_y, left: place.weightline_x, border: '1mm solid black'},
                line_weight: {top: place.line_weight_y, left: place.line_weight_x},
                weight_range: {top: place.weight_range_y, left: place.weight_range_x},
                //肌肉 muscle
                muscleline: {top: place.muscleline_y, left: place.muscleline_x, border: '1mm solid black'},
                line_muscle: {top: place.line_muscle_y, left: place.line_muscle_x},
                muscle_range: {top: place.muscle_range_y, left: place.muscle_range_x},
                //体脂 pbf
                pbfline: {top: place.pbfline_y, left: place.pbfline_x, border: '1mm solid black'},
                line_pbf: {top: place.line_pbf_y, left: place.line_pbf_x},
                pbf_range: {top: place.pbf_range_y, left: place.pbf_range_x},
                //骨质 bone
                bone_range_copy: {top: place.bone_range_copy_y, left: place.bone_range_copy_x},
                //水分 water
                water_range_copy: {top: place.water_range_copy_y, left: place.water_range_copy_x},
                //骨骼肌 smm
                smmline: {top: place.smmline_y, left: place.smmline_x, border: '1mm solid black'},
                line_smm: {top: place.line_smm_y, left: place.line_smm_x},
                smm_range: {top: place.smm_range_y, left: place.smm_range_x},
                //体质指数 bmi
                bmiline: {top: place.bmiline_y, left: place.bmiline_x, border: '1mm solid black'},
                line_bmi: {top: place.line_bmi_y, left: place.line_bmi_x},
                bmi_range: {top: place.bmi_range_y, left: place.bmi_range_x},
                //腰臀比 whr
                whrline: {top: place.whrline_y, left: place.whrline_x, border: '1mm solid black'},
                line_whr: {top: place.line_whr_y, left: place.line_whr_x},
                whr_range: {top: place.whr_range_y, left: place.whr_range_x},
                //内脏脂肪 vfi
                vfiline: {top: place.vfiline_y, left: place.vfiline_x, border: '1mm solid black'},
                line_vfi: {top: place.line_vfi_y, left: place.line_vfi_x},
                vfi_range: {top: place.vfi_range_y, left: place.vfi_range_x},
                //躯干脂肪 tr_fat
                tr_fatline: {top: place.tr_fatline_y, left: place.tr_fatline_x, border: '1mm solid black'},
                line_tr_fat: {top: place.line_tr_fat_y, left: place.line_tr_fat_x},
                tr_fat_range: {top: place.tr_fat_range_y, left: place.tr_fat_range_x},
                //1C 脂肪 fatline_copy
                fatline_copy: {top: place.fatline_copy_y, left: place.fatline_copy_x, border: '1mm solid black'},
                line_fat_copy: {top: place.line_fat_copy_y, left: place.line_fat_copy_x},
                fat_range_copy: {top: place.fat_range_copy_y, left: place.fat_range_copy_x},
                //水分比例 waterline_copy
                waterline_copy: {top: place.waterline_copy_y, left: place.waterline_copy_x, border: '1mm solid black'},
                line_water_copy: {top: place.line_water_copy_y, left: place.line_water_copy_x},
                water_persent_range: {top: place.water_persent_range_y, left: place.water_persent_range_x},
                //蛋白质
                protein_range_copy: {top: place.protein_range_copy_y, left: place.protein_range_copy_x},

                /*内脏脂肪分析*/
                tr_fat: {top: place.tr_fat_y, left: place.tr_fat_x},

                /*水肿分析*/
                water_scale_copy: {top: place.water_scale_copy_y, left: place.water_scale_copy_x},
                icw_copy: {top: place.icw_copy_y, left: place.icw_copy_x},//细胞内液
                ecw_copy: {top: place.ecw_copy_y, left: place.ecw_copy_x},//细胞外液
                edema: {top: place.edema_y, left: place.edema_x},//水肿系数
                edema_range: {top: place.edema_range_y, left: place.edema_range_x},
                edematrue: {top: place.edematrue_y, left: place.edematrue_x},

                /*节段分析*/
                //水分
                tr_water: {top: place.tr_water_y, left: place.tr_water_x},
                la_water: {top: place.la_water_y, left: place.la_water_x},
                ra_water: {top: place.ra_water_y, left: place.ra_water_x},
                ll_water: {top: place.ll_water_y, left: place.ll_water_x},
                rl_water: {top: place.rl_water_y, left: place.rl_water_x},
                //脂肪
                tr_fat_copy: {top: place.tr_fat_copy_y, left: place.tr_fat_copy_x},
                la_fat: {top: place.la_fat_y, left: place.la_fat_x},
                ra_fat: {top: place.ra_fat_y, left: place.ra_fat_x},
                ll_fat: {top: place.ll_fat_y, left: place.ll_fat_x},
                rl_fat: {top: place.rl_fat_y, left: place.rl_fat_x},
                //肌肉
                tr_muscle: {top: place.tr_muscle_y, left: place.tr_muscle_x},
                la_muscle: {top: place.la_muscle_y, left: place.la_muscle_x},
                ra_muscle: {top: place.ra_muscle_y, left: place.ra_muscle_x},
                ll_muscle: {top: place.ll_muscle_y, left: place.ll_muscle_x},
                rl_muscle: {top: place.rl_muscle_y, left: place.rl_muscle_x},

                /*体型判定*/
                body_type: {
                    width: '4mm',
                    height: '4mm',
                    background: '#000',
                    top: place.bode_type_y,
                    left: place.bode_type_x
                },

                /*肥胖分析*/
                bmi: {top: place.bmi_y, left: place.bmi_x},
                pbftrue: {top: place.pbftrue_y, left: place.pbftrue_x},
                whrtrue: {top: place.whrtrue_y, left: place.whrtrue_x},

                /*营养分析*/
                proteintrue: {top: place.proteintrue_y, left: place.proteintrue_x},
                pbftrue_copy: {top: place.pbftrue_copy_y, left: place.pbftrue_copy_x},
                bonetrue: {top: place.bonetrue_y, left: place.bonetrue_x},
                bmr: {top: place.bmr_y, left: place.bmr_x},//基础代谢
                daily_energy: {top: place.daily_energy_y, left: place.daily_energy_x},
                unit_bmr: {top: place.unit_bmr_y, left: place.unit_bmr_x},

                /*骨骼肌*/
                smm: {top: place.smm_y, left: place.smm_x},
                smmtrue: {top: place.smmtrue_y, left: place.smmtrue_x},
                up_muscle: {top: place.up_muscle_y, left: place.up_muscle_x},
                down_muscle: {top: place.down_muscle_y, left: place.down_muscle_x},
                balance: {top: place.balance_y, left: place.balance_x},
            };
        },
        setCoordinate_1B() {
            let _this = vm;
            _this.bgImage.backgroundImage = "url('/img/1B-report.jpg')";
            _this.$options.methods.coordinate();
            _this.btn.sex.left = _this.message.sex === '1' ? _this.coordinate.sex_x : parseFloat(_this.coordinate.sex_x) + 16 + 'mm';//性别勾选

            //数据处理
            /*要增加的数据*/
            /*
            * 骨质百分比
            * 蛋白质百分比
            * 水分百分比 -> 2份
            * 水分总量
            * 躯干脂肪
            * 细胞内液
            * 细胞外液
            * 体脂对勾 -> 2份
            * */
            _this.message.bone_scale = ((_this.message.bone / _this.message.weight) * 100).toFixed(1) + '%';
            _this.message.protein_scale = ((_this.message.protein / _this.message.weight) * 100).toFixed(1) + '%';
            _this.message.water_scale = ((_this.message.water / _this.message.weight) * 100).toFixed(1) + '%';
            _this.message.water_scale_copy = _this.message.water_scale.replace('%','');
            _this.message.water_copy = _this.message.water;
            _this.message.tr_fat_copy = _this.message.tr_fat;
            _this.message.icw_copy = _this.message.icw;
            _this.message.ecw_copy = _this.message.ecw;
            _this.message.pbftrue = _this.message.pbftrue_copy = _this.message.proteintrue = _this.message.whrtrue = _this.message.bonetrue = _this.message.edematrue = '';

            //线后数据
            _this.message.line_weight = _this.message.weight;
            _this.message.line_muscle = _this.message.muscle;
            _this.message.line_pbf = _this.message.pbf;
            _this.message.line_bone = _this.message.bone;
            _this.message.line_water = _this.message.water;
            _this.message.line_smm = _this.message.smm;
            _this.message.line_bmi = _this.message.bmi;
            _this.message.line_whr = _this.message.whr;
            _this.message.line_vfi = _this.message.vfi;
            /*范围计算*/
            /*
            * 体重范围*/
            _this.$options.methods.normalScope();
            /*要删减的数据*/
            let del = ['id', 'testid', 'uuid', 'deviceid', 'smm', 'vfi', 'tr_muscle', 'la_muscle', 'ra_muscle', 'll_muscle', 'rl_muscle', 'liver_risk', 'whr'];
            for (let i = 0; i < del.length; i++) {
                delete _this.message[del[i]];
            }
            _this.$options.methods.localScope();
        },
        setCoordinate_1C() {
            let _this = vm;
            _this.bgImage.backgroundImage = "url('/img/1C-meiti-report.jpg')";
            _this.$options.methods.coordinate();
            _this.btn.sex.left = _this.message.sex === '1' ? _this.coordinate.sex_x : parseFloat(_this.coordinate.sex_x) + 16 + 'mm';//性别勾选
            /*要增加的数据*/
            /*
            * 每日热量需求 -> daily_energy 根据标准体重(height - 100)、BMI计算每日所需能量
            * 单位体重基础代谢 unit_bmr
            * */

            _this.message.proteintrue = _this.message.pbftrue = _this.message.bonetrue = '';

            let stWeight = _this.message.height - 100, BMI = _this.message.bmi, BMR = _this.message.bmr;
            let DailyEnergy = 0;
            //BMI按18.5-23-25划分消瘦、正常、超重、肥胖
            //每张公斤标准体重的能量需要（极轻体力劳动）：消瘦：35; 正常：30；超重25；肥胖：20；
            if (BMI < 18.5) {
                DailyEnergy = stWeight * 35;
            } else if (BMI >= 18.5 && BMI <= 23) {
                DailyEnergy = stWeight * 30;
            } else if (BMI > 23 && BMI < 25) {
                DailyEnergy = stWeight * 25;
            } else if (BMI >= 25) {
                DailyEnergy = stWeight * 20;
            }
            if (DailyEnergy <= BMR) {
                DailyEnergy = BMR + 250;
            }
            _this.message.daily_energy = DailyEnergy.toFixed(1);
            _this.message.unit_bmr = (_this.message.bmr / _this.message.weight).toFixed(1);

            //线后数据
            _this.message.line_weight = _this.message.weight;
            _this.message.line_pbf = _this.message.pbf;
            _this.message.line_fat_copy = _this.message.line_fat = _this.message.fat;
            _this.message.line_bone = _this.message.bone;
            _this.message.line_water = _this.message.water;
            _this.message.line_water_copy = ((_this.message.water / _this.message.weight) * 100).toFixed(1);
            _this.message.line_protein = _this.message.protein;
            _this.message.line_bmi = _this.message.bmi;
            _this.message.line_whr = _this.message.whr;
            _this.message.line_vfi = _this.message.vfi;
            _this.$options.methods.normalScope();
            /*删除数据*/
            let del = ['id', 'testid', 'uuid', 'deviceid', 'protein', 'fat', 'bone', 'water', 'icw', 'ecw', 'weight', 'lbm', 'muscle', 'pbf', 'smm', 'whr', 'edema', 'vfi', 'tr_fat', 'la_fat', 'ra_fat', 'll_fat', 'rl_fat', 'tr_water', 'la_water', 'ra_water', 'll_water', 'rl_water', 'tr_muscle', 'la_muscle', 'ra_muscle', 'll_muscle', 'rl_muscle', 'liver_risk', 'bmi'];
            for (let i = 0; i < del.length; i++) {
                delete _this.message[del[i]];
            }
            _this.$options.methods.localScope();
        },
        setCoordinate_1D() {
            let _this = vm;
            _this.bgImage.backgroundImage = "url('/img/1D-report.jpg')";
            _this.$options.methods.coordinate();
            _this.btn.sex.left = _this.message.sex === '1' ? _this.coordinate.sex_x : parseFloat(_this.coordinate.sex_x) + 16 + 'mm';//性别勾选
            //数据处理
            /*要增加的数据*/
            /*
            * 脂肪百分比
            * 骨质百分比
            * 蛋白质百分比
            * 分水百分比
            * 水分总量
            * */
            _this.message.bone_scale = ((_this.message.bone / _this.message.weight) * 100).toFixed(1) + '%';
            _this.message.protein_scale = ((_this.message.protein / _this.message.weight) * 100).toFixed(1) + '%';
            _this.message.water_scale = ((_this.message.water / _this.message.weight) * 100).toFixed(1) + '%';
            _this.message.water_copy = _this.message.water;
            _this.message.smmtrue = _this.message.whrtrue = _this.message.up_muscle = _this.message.down_muscle = _this.message.balance = '';

            _this.$options.methods.normalScope();

            //线后数据
            _this.message.line_muscle = _this.message.muscle;
            _this.message.line_protein = _this.message.protein;
            _this.message.line_fat = _this.message.fat;
            _this.message.line_pbf = _this.message.pbf;
            _this.message.line_smm = _this.message.smm;
            _this.message.line_bmi = _this.message.bmi;
            _this.message.line_whr = _this.message.whr;
            _this.message.line_vfi = _this.message.vfi;
            _this.message.line_tr_fat = _this.message.tr_fat;

            /*要删除的数据*/
            let del = ['id', 'testid', 'uuid', 'deviceid', 'whr', 'edema', 'vfi', 'tr_water', 'la_water', 'ra_water', 'll_water', 'rl_water', 'liver_risk'];
            for (let i = 0; i < del.length; i++) {
                delete _this.message[del[i]];
            }
            _this.$options.methods.localScope();
        },
        //体型位置计算
        localScope() {
            let _this = vm;
            switch (_this.message.body_type) {
                case 1:
                    _this.btn.body_type.top = parseFloat(_this.coordinate.body_type_y) - 17 + 'mm';
                    _this.btn.body_type.left = parseFloat(_this.coordinate.body_type_x) - 19 + 'mm';
                    break;
                case 2:
                    _this.btn.body_type.top = parseFloat(_this.coordinate.body_type_y) - 17 + 'mm';
                    _this.btn.body_type.left = _this.coordinate.body_type_x;
                    break;
                case 3:
                    _this.btn.body_type.top = parseFloat(_this.coordinate.body_type_y) - 17 + 'mm';
                    _this.btn.body_type.left = parseFloat(_this.coordinate.body_type_x) + 19 + 'mm';
                    break;
                case 4:
                    _this.btn.body_type.top = _this.coordinate.body_type_y;
                    _this.btn.body_type.left = parseFloat(_this.coordinate.body_type_x) - 19 + 'mm';
                    break;
                case 5:
                    _this.btn.body_type.top = _this.coordinate.body_type_y;
                    _this.btn.body_type.left = _this.coordinate.body_type_x;
                    break;
                case 6:
                    _this.btn.body_type.top = _this.coordinate.body_type_y;
                    _this.btn.body_type.left = parseFloat(_this.coordinate.body_type_x) + 19 + 'mm';
                    break;
                case 7:
                    _this.btn.body_type.top = parseFloat(_this.coordinate.body_type_y) + 17 + 'mm';
                    _this.btn.body_type.left = parseFloat(_this.coordinate.body_type_x) - 19 + 'mm';
                    break;
                case 8:
                    _this.btn.body_type.top = parseFloat(_this.coordinate.body_type_y) + 17 + 'mm';
                    _this.btn.body_type.left = _this.coordinate.body_type_x;
                    break;
                case 9:
                    _this.btn.body_type.top = parseFloat(_this.coordinate.body_type_y) + 17 + 'mm';
                    _this.btn.body_type.left = parseFloat(_this.coordinate.body_type_x) + 19 + 'mm';
                    break;
            }
        },
        //范围计算
        normalScope() {
            let _this = vm;
            let heightValue = parseFloat(_this.message.height);
            let weightValue = parseFloat(_this.message.weight);
            //体重计算：
            let weight_min, weight_max, weight_range;
            weight_min = (heightValue / 100) * (heightValue / 100) * 18.5;
            weight_max = (heightValue / 100) * (heightValue / 100) * 23.9;

            let SM, fat_min, fat_max, pbf_min, pbf_max;

            //肌肉计算 && 腰臀比
            let muscle_min, muscle_max, muscle_range, whr_min, whr_max, whr_range;
            if (_this.message.sex == "2") {
                SM = 0.00351 * heightValue * heightValue - 0.4661 * heightValue + 23.04821;
                fat_min = weightValue * 0.18;
                fat_max = weightValue * 0.28;
                pbf_min = 18.0;
                pbf_max = 28.0;
                whr_min = 0.70;
                whr_max = 0.80;
            } else {
                SM = 0.00344 * heightValue * heightValue - 0.37678 * heightValue + 14.40021;
                fat_min = weightValue * 0.10;
                fat_max = weightValue * 0.20;
                pbf_min = 10.0;
                pbf_max = 20.0;
                whr_min = 0.85;
                whr_max = 0.95;
            }
            //BCA-1C-2 -> 1C美体版
            let swValue = parseFloat(_this.message.standard_weight);
            if (_this.message.devicetype === 'BCA-1C-2') {
                weight_min = swValue * 0.9;
                weight_max = swValue * 1.1;
                if (_this.message.sex == "2") {
                    fat_min = swValue * 0.18;
                    fat_max = swValue * 0.28;
                } else {
                    fat_min = swValue * 0.10;
                    fat_max = swValue * 0.20;
                }
            }

            muscle_min = SM * 0.9;
            muscle_max = SM * 1.1;

            //骨质
            let bone_min, bone_max, bone_range;
            bone_min = weightValue * 0.045;
            bone_max = weightValue * 0.055;

            //水分
            let water_min, water_max, water_range;
            water_min = weightValue * 0.6 * 0.9;
            water_max = weightValue * 0.6 * 1.1;

            //蛋白质
            let protein_min = weightValue * 0.14;
            let protein_max = weightValue * 0.17;

            //体质指数

            weight_range = `[${weight_min.toFixed(1)}-${weight_max.toFixed(1)}]`;
            muscle_range = `[${muscle_min.toFixed(1)}-${muscle_max.toFixed(1)}]`;
            let pbf_range = `[${pbf_min.toFixed(1)}-${pbf_max.toFixed(1)}]`;
            bone_range = `[${bone_min.toFixed(1)}-${bone_max.toFixed(1)}]`;
            water_range = `[${water_min.toFixed(1)}-${water_max.toFixed(1)}]`;
            let smm_range = `[${(muscle_min * 0.75).toFixed(1)}-${(muscle_max * 0.75).toFixed(1)}]`;
            whr_range = `[${whr_min.toFixed(2)}-${whr_max.toFixed(2)}]`;

            // _this.message.muscle_range = muscle_range;//肌肉范围
            /*B、C、D共有的*/
            _this.message.pbf_range = pbf_range;//体脂范围
            _this.message.bone_range = bone_range;//骨质范围
            _this.message.water_range = water_range;//水分范围
            _this.message.bmi_range = '[18.5-23.9]';//体质指数范围
            _this.message.whr_range = whr_range;//腰臀比范围
            _this.message.fat_range = `[${(pbf_min * weightValue / 100).toFixed(1)}-${(pbf_max * weightValue / 100).toFixed(1)}]`;//脂肪范围
            _this.message.protein_range = `[${protein_min.toFixed(1)}-${protein_max.toFixed(1)}]`;//蛋白质范围

            /*B、C共有的*/
            if (_this.message.devicetype.indexOf('1B') > -1 || _this.message.devicetype.indexOf('1C') > -1) {
                _this.message.weight_range = weight_range;//体重范围
            }

            /*B、D共有的*/
            if (_this.message.devicetype.indexOf('1B') > -1 || _this.message.devicetype.indexOf('1D') > -1) {
                _this.message.muscle_range = muscle_range;//肌肉范围
                _this.message.smm_range = smm_range;//骨骼肌范围
            }

            /**************************************************** BCA-1B ***********************************************************/

            if (_this.message.devicetype.indexOf('1B') > -1) {

                _this.message.edema_range = '[0.3-0.35]';//水肿系数范围
                _this.message.bone_range_copy = bone_range;
                _this.message.water_range_copy = water_range;

                //BMI等级
                let bmi = _this.message.bmi;
                if (bmi < 18.5) {
                    _this.btn.bmi.left = parseFloat(_this.coordinate.bmi_x) - 20 + 'mm';
                } else if (bmi >= 18.5 && bmi <= 24) {
                    //数据库存储，不调整
                } else if (bmi > 24 && bmi <= 30) {
                    _this.btn.bmi.left = parseFloat(_this.coordinate.bmi_x) + 21 + 'mm';
                } else if (bmi > 30 && bmi <= 35) {
                    __this.btn.bmi.left = parseFloat(_this.coordinate.bmi_x) - 20 + 'mm';
                    __this.btn.bmi.top = parseFloat(_this.coordinate.bmi_y) + 6 + 'mm';
                } else if (bmi > 35 && bmi <= 40) {
                    __this.btn.bmi.top = parseFloat(_this.coordinate.bmi_y) + 6 + 'mm';
                } else if (bmi > 40) {
                    __this.btn.bmi.left = parseFloat(_this.coordinate.bmi_x) + 21 + 'mm';
                    __this.btn.bmi.top = parseFloat(_this.coordinate.bmi_y) + 6 + 'mm';
                }
                //脂肪
                if (_this.message.pbf < pbf_min) {
                    _this.btn.pbftrue.left = parseFloat(_this.coordinate.pbftrue_x) - 11 + 'mm';
                    _this.btn.pbftrue_copy.left = parseFloat(_this.coordinate.pbftrue_copy_x) - 13 + 'mm';
                } else if (_this.message.pbf >= pbf_min && _this.message.pbf <= pbf_max) {
                    //正常
                } else if (_this.message.pbf > pbf_max) {
                    _this.btn.pbftrue.left = parseFloat(_this.coordinate.pbftrue_x) + 14 + 'mm';
                    _this.btn.pbftrue_copy.left = parseFloat(_this.coordinate.pbftrue_copy_x) + 14 + 'mm';
                }
                //蛋白质
                _this.btn.proteintrue.left = _this.message.protein < protein_min ? parseFloat(_this.coordinate.proteintrue_x) - 13 + 'mm' : _this.coordinate.proteintrue_x;
                //腰臀比
                if (_this.message.sex === '1') {
                    if (_this.message.whr < 0.85) {
                        _this.btn.whrtrue.left = parseFloat(_this.coordinate.whrtrue_x) - 16 + 'mm';
                    } else if (_this.message.whr > 0.95) {
                        _this.btn.whrtrue.left = parseFloat(_this.coordinate.whrtrue_x) + 15 + 'mm';
                    } else {
                        //正常
                    }
                } else {
                    if (_this.message.whr < 0.7) {
                        _this.btn.whrtrue.left = parseFloat(_this.coordinate.whrtrue_x) - 16 + 'mm';
                    } else if (_this.message.whr > 0.8) {
                        _this.btn.whrtrue.left = parseFloat(_this.coordinate.whrtrue_x) + 15 + 'mm';
                    } else {
                        //正常
                    }
                }
                //无机盐（骨质）
                _this.btn.bonetrue.left = _this.message.bone < bone_min ? parseFloat(_this.coordinate.bonetrue_x) - 13 + 'mm' : _this.coordinate.bonetrue_x;
                //水肿
                if (_this.message.edema < 0.3) {
                    _this.btn.edematrue.top = parseFloat(_this.coordinate.edematrue_y) - 4 + 'mm';
                } else if (_this.message.edema > 0.35) {
                    _this.btn.edematrue.top = parseFloat(_this.coordinate.edematrue_y) + 4 + 'mm';
                } else {
                    //数据库存储，不调整   正常
                }


                //线条长度计算
                /*
                * 正常范围右侧长度44mm
                * 正常范围长度16mm
                * 计算方式：正常范围长度/正常范围 = 每个单位值需要多少毫米
                * 当前值与正常范围最大值比较得出结果，与上一步的值做计算，然后用56mm做加减运算
                * */
                let totalline = 44, normalline = 16;
                //计算体重长度
                let weightline = totalline - ((normalline / (weight_max - weight_min)) * (weight_max - weightValue)).toFixed(1);
                _this.message.weightline = weightline;
                _this.btn.weightline.width = weightline + 'mm';
                _this.btn.line_weight.left = weightline + parseFloat(_this.coordinate.line_weight_x) + 'mm';
                //肌肉
                let muscleline = totalline - ((normalline / (muscle_max - muscle_min)) * (muscle_max - _this.message.muscle)).toFixed(1);
                _this.message.muscleline = muscleline;
                _this.btn.muscleline.width = muscleline + 'mm';
                _this.btn.line_muscle.left = muscleline + parseFloat(_this.coordinate.line_muscle_x) + 'mm';
                //体脂
                let pbfline = totalline - ((normalline / (pbf_max - pbf_min)) * (pbf_max - _this.message.pbf)).toFixed(1);
                _this.message.pbfline = pbfline;
                _this.btn.pbfline.width = pbfline + 'mm';
                _this.btn.line_pbf.left = pbfline + parseFloat(_this.coordinate.line_pbf_x) + 'mm';
                //骨质
                let boneline = totalline - ((normalline / (bone_max - bone_min)) * (bone_max - _this.message.bone)).toFixed(1);
                _this.message.boneline = boneline;
                _this.btn.boneline.width = boneline + 'mm';
                _this.btn.line_bone.left = boneline + parseFloat(_this.coordinate.line_bone_x) + 'mm';
                //水分
                let waterline = totalline - ((normalline / (water_max - water_min)) * (water_max - _this.message.water)).toFixed(1);
                _this.message.waterline = waterline;
                _this.btn.waterline.width = waterline + 'mm';
                _this.btn.line_water.left = waterline + parseFloat(_this.coordinate.line_water_x) + 'mm';
                //骨骼肌
                let smmline = totalline - ((normalline / (muscle_max - muscle_min)) * 0.75 * (muscle_max * 0.75 - _this.message.smm)).toFixed(1);
                _this.message.smmline = smmline;
                _this.btn.smmline.width = smmline + 'mm';
                _this.btn.line_smm.left = smmline + parseFloat(_this.coordinate.line_smm_x) + 'mm';
                //体质指数
                let bmiline = totalline - ((normalline / (23.9 - 18.5)) * (23.9 - _this.message.bmi)).toFixed(1);
                _this.message.bmiline = bmiline;
                _this.btn.bmiline.width = bmiline + 'mm';
                _this.btn.line_bmi.left = bmiline + parseFloat(_this.coordinate.line_bmi_x) + 'mm';
                //腰臀比
                let whrline = totalline - ((normalline / (whr_max - whr_min)) * (whr_max - _this.message.whr)).toFixed(1);
                _this.message.whrline = whrline;
                _this.btn.whrline.width = whrline + 'mm';
                _this.btn.line_whr.left = whrline + parseFloat(_this.coordinate.line_whr_x) + 'mm';
                //内脏指数
                let vfiline;
                if (_this.message.vfi < 6) {
                    vfiline = 0;
                    _this.btn.vfiline.border = '0mm';

                } else {
                    vfiline = (parseFloat(_this.message.vfi) - 6) * 4.5;
                }
                _this.message.vfiline = vfiline;
                _this.btn.vfiline.width = vfiline + 'mm';
                _this.btn.line_vfi.left = vfiline + parseFloat(_this.coordinate.line_vfi_x) + 'mm';
            }

            /**************************************************** BCA-1C ***********************************************************/

            if (_this.message.devicetype.indexOf('1C') > -1) {

                _this.message.vfi_range = '[5-10]';
                _this.message.water_persent_range = '[54-66]';
                _this.message.fat_range_copy = _this.message.fat_range;

                //脂肪
                if (_this.message.pbf < pbf_min) {
                    _this.btn.pbftrue.left = parseFloat(_this.coordinate.pbftrue_x) - 13 + 'mm';
                } else if (_this.message.pbf >= pbf_min && _this.message.pbf <= pbf_max) {
                    //正常
                } else if (_this.message.pbf > pbf_max) {
                    _this.btn.pbftrue.left = parseFloat(_this.coordinate.pbftrue_x) + 14 + 'mm';
                }
                //蛋白质
                _this.btn.proteintrue.left = _this.message.protein < protein_min ? parseFloat(_this.coordinate.proteintrue_x) - 13 + 'mm' : _this.coordinate.bonetrue_x;
                //无机盐（骨质）
                _this.btn.bonetrue.left = _this.message.bone < bone_min ? parseFloat(_this.coordinate.bonetrue_x) - 13 + 'mm' : _this.coordinate.bonetrue_x;

                //线条长度计算
                let totalline = 44, normalline = 16;
                //计算体重长度
                let weightline = totalline - ((normalline / (weight_max - weight_min)) * (weight_max - weightValue)).toFixed(1);
                _this.message.weightline = weightline;
                _this.btn.weightline.width = weightline + 'mm';
                _this.btn.line_weight.left = weightline + parseFloat(_this.coordinate.line_weight_x) + 'mm';
                //脂肪 && 脂肪拷贝
                let fatline = totalline - ((normalline / (fat_max - fat_min)) * (fat_max - _this.message.fat)).toFixed(1);
                _this.message.fatline = fatline;
                _this.message.fatline_copy = fatline;
                _this.btn.fatline.width = fatline + 'mm';
                _this.btn.fatline_copy.width = fatline + 'mm';
                _this.btn.line_fat.left = fatline + parseFloat(_this.coordinate.line_fat_x) + 'mm';
                _this.btn.line_fat_copy.left = fatline + parseFloat(_this.coordinate.line_fat_copy_x) + 'mm';
                //体脂
                let pbfline = totalline - ((normalline / (pbf_max - pbf_min)) * (pbf_max - _this.message.pbf)).toFixed(1);
                _this.message.pbfline = pbfline;
                _this.btn.pbfline.width = pbfline + 'mm';
                _this.btn.line_pbf.left = pbfline + parseFloat(_this.coordinate.line_pbf_x) + 'mm';
                //骨质
                let boneline = totalline - ((normalline / (bone_max - bone_min)) * (bone_max - _this.message.bone)).toFixed(1);
                _this.message.boneline = boneline;
                _this.btn.boneline.width = boneline + 'mm';
                _this.btn.line_bone.left = boneline + parseFloat(_this.coordinate.line_bone_x) + 'mm';
                //水分 && 水分比例
                let waterline = totalline - ((normalline / (water_max - water_min)) * (water_max - _this.message.water)).toFixed(1);
                _this.message.waterline = waterline;
                _this.message.waterline_copy = waterline;
                _this.btn.waterline.width = waterline + 'mm';
                _this.btn.waterline_copy.width = waterline + 'mm';
                _this.btn.line_water.left = waterline + parseFloat(_this.coordinate.line_water_x) + 'mm';
                _this.btn.line_water_copy.left = waterline + 35 + 'mm';
                //蛋白质
                let proteinline = totalline - ((normalline / (protein_max - protein_min)) * (protein_max - _this.message.protein)).toFixed(1);
                _this.message.proteinline = proteinline;
                _this.btn.proteinline.width = proteinline + 'mm';
                _this.btn.line_protein.left = proteinline + parseFloat(_this.coordinate.line_protein_x) + 'mm';
                //体质指数
                let bmiline = totalline - ((normalline / (23.9 - 18.5)) * (23.9 - _this.message.bmi)).toFixed(1);
                _this.message.bmiline = bmiline;
                _this.btn.bmiline.width = bmiline + 'mm';
                _this.btn.line_bmi.left = bmiline + parseFloat(_this.coordinate.line_bmi_x) + 'mm';
                //腰臀比
                let whrline = totalline - ((normalline / (whr_max - whr_min)) * (whr_max - _this.message.whr)).toFixed(1);
                _this.message.whrline = whrline;
                _this.btn.whrline.width = whrline + 'mm';
                _this.btn.line_whr.left = whrline + parseFloat(_this.coordinate.line_whr_x) + 'mm';
                //内脏指数
                let vfiline = totalline - (normalline / (5 * (10 - _this.message.vfi))).toFixed(1);
                _this.message.vfiline = vfiline;
                _this.btn.vfiline.width = vfiline + 'mm';
                _this.btn.line_vfi.left = vfiline + parseFloat(_this.coordinate.line_vfi_x) + 'mm';
            }

            /**************************************************** BCA-1D ***********************************************************/

            if (_this.message.devicetype.indexOf('1D') > -1) {
                _this.message.vfi_range = '[ < 14]';
                _this.message.protein_range_copy = _this.message.protein_range;
                _this.message.fat_range_copy = _this.message.fat_range;
                _this.message.tr_fat_range = `[${(fat_min * 0.5).toFixed(1)}-${(fat_max * 0.5).toFixed(1)}]`;
                //BMI等级
                let bmi = _this.message.bmi;
                if (bmi < 18.5) {
                    _this.btn.bmi.left = parseFloat(_this.coordinate.bmi_x) - 20 + 'mm';
                } else if (bmi >= 18.5 && bmi <= 24) {
                    //数据库存储，不调整
                } else if (bmi > 24 && bmi <= 30) {
                    _this.btn.bmi.left = parseFloat(_this.coordinate.bmi_x) + 20 + 'mm';
                } else if (bmi > 30 && bmi <= 35) {
                    __this.btn.bmi.left = parseFloat(_this.coordinate.bmi_x) - 20 + 'mm';
                    __this.btn.bmi.top = parseFloat(_this.coordinate.bmi_y) + 6 + 'mm';
                } else if (bmi > 35 && bmi <= 40) {
                    __this.btn.bmi.top = parseFloat(_this.coordinate.bmi_y) + 6 + 'mm';
                } else if (bmi > 40) {
                    __this.btn.bmi.left = parseFloat(_this.coordinate.bmi_x) + 20 + 'mm';
                    __this.btn.bmi.top = parseFloat(_this.coordinate.bmi_y) + 6 + 'mm';
                }
                //腰臀比
                if (_this.message.sex === '1') {
                    if (_this.message.whr < 0.85) {
                        _this.btn.whrtrue.left = parseFloat(_this.coordinate.whrtrue_x) - 16 + 'mm';
                    } else if (_this.message.whr > 0.95) {
                        _this.btn.whrtrue.left = parseFloat(_this.coordinate.whrtrue_x) + 13 + 'mm';
                    } else {
                        //正常
                    }
                } else {
                    if (_this.message.whr < 0.7) {
                        _this.btn.whrtrue.left = parseFloat(_this.coordinate.whrtrue_x) - 16 + 'mm';
                    } else if (_this.message.whr > 0.8) {
                        _this.btn.whrtrue.left = parseFloat(_this.coordinate.whrtrue_x) + 13 + 'mm';
                    } else {
                        //正常
                    }
                }
                //骨骼肌
                if (_this.message.smm < muscle_min * 0.75) {
                    _this.btn.smmtrue.left = parseFloat(_this.coordinate.smmtrue_x) - 13 + 'mm';
                } else if (_this.message.smm > muscle_max * 0.75) {
                    _this.btn.smmtrue.left = parseFloat(_this.coordinate.smmtrue_x) + 12 + 'mm';
                } else {
                    //正常
                }
                //肢体肌肉及左右平衡计算
                /**
                 * 标准肌肉 已计算 SM ，男女有别
                 * 上肢肌肉（左上肌肉量+右上肌肉量）：(0.05 --- 0.15) * 标准肌肉  up_m_min-up_m_max
                 * 下肢肌肉（左下肌肉量+右下肌肉量）：(0.25 --- 0.35) * 标准肌肉  down_m_min-down_m_max
                 * 侧平均肌肉 = （左上肌肉+左下肌肉+右上肌肉+右下肌肉）/2  balance_muscle
                 * 如果 （左上肌肉+左下肌肉）<  0.9 *单侧肌肉平均值
                 * 或者 （左上肌肉+左下肌肉）>  1.1 *单侧肌肉平均值  --> 不平衡
                 */
                let up_muscle = _this.message.la_muscle + _this.message.ra_muscle;
                let down_muscle = _this.message.ll_muscle + _this.message.rl_muscle;
                let up_m_min = 0.05 * SM;
                let up_m_max = 0.15 * SM;
                let down_m_min = 0.25 * SM;
                let down_m_max = 0.35 * SM;
                console.log(up_muscle, up_m_min, up_m_max, down_m_max, down_m_min, down_muscle);
                //上肢
                if (up_muscle < up_m_min) {
                    _this.btn.up_muscle.top = parseFloat(_this.coordinate.up_muscle_y) - 4 + 'mm';
                } else if (up_muscle > up_m_max) {
                    _this.btn.up_muscle.top = parseFloat(_this.coordinate.up_muscle_y) + 4 + 'mm';
                } else {
                    //正常
                }
                //下肢
                if (down_muscle < down_m_min) {
                    _this.btn.down_muscle.top = parseFloat(_this.coordinate.down_muscle_y) - 4 + 'mm';
                } else if (down_muscle > down_m_max) {
                    _this.btn.down_muscle.top = parseFloat(_this.coordinate.down_muscle_y) + 4 + 'mm';
                } else {
                    //正常
                }
                //平衡
                let balance_muscle = (up_muscle + down_muscle) / 2;
                let left_muscle = _this.message.la_muscle + _this.message.ll_muscle;
                if (left_muscle < 0.9 * balance_muscle || left_muscle > 1.1 * balance_muscle) {
                    _this.btn.balance.top = parseFloat(_this.coordinate.balance_y) + 4 + 'mm';
                } else {
                    //正常
                }

                //线条长度计算
                let totalline = 44, normalline = 16;
                //计算体重长度
                //肌肉
                let muscleline = totalline - ((normalline / (muscle_max - muscle_min)) * (muscle_max - _this.message.muscle)).toFixed(1);
                _this.message.muscleline = muscleline;
                _this.btn.muscleline.width = muscleline + 'mm';
                _this.btn.line_muscle.left = muscleline + parseFloat(_this.coordinate.line_muscle_x) + 'mm';
                //脂肪
                let fatline = totalline - ((normalline / (fat_max - fat_min)) * (fat_max - _this.message.fat)).toFixed(1);
                _this.message.fatline = fatline;
                _this.btn.fatline.width = fatline + 'mm';
                _this.btn.line_fat.left = fatline + parseFloat(_this.coordinate.line_fat_x) + 'mm';
                //体脂
                let pbfline = totalline - ((normalline / (pbf_max - pbf_min)) * (pbf_max - _this.message.pbf)).toFixed(1);
                _this.message.pbfline = pbfline;
                _this.btn.pbfline.width = pbfline + 'mm';
                _this.btn.line_pbf.left = pbfline + parseFloat(_this.coordinate.line_pbf_x) + 'mm';
                //蛋白质
                let proteinline = totalline - ((normalline / (protein_max - protein_min)) * (protein_max - _this.message.protein)).toFixed(1);
                _this.message.proteinline = proteinline;
                _this.btn.proteinline.width = proteinline + 'mm';
                _this.btn.line_protein.left = proteinline + parseFloat(_this.coordinate.line_protein_x) + 'mm';
                //躯干脂肪量 tr_fatline
                let tr_fatline = totalline - ((normalline / (fat_max - fat_min)) * 0.5 * (fat_max * 0.5 - _this.message.tr_fat)).toFixed(1);
                _this.message.tr_fatline = tr_fatline;
                _this.btn.tr_fatline.width = tr_fatline + 'mm';
                _this.btn.line_tr_fat.left = tr_fatline + parseFloat(_this.coordinate.line_tr_fat_x) + 'mm';
                //骨骼肌
                let smmline = totalline - ((normalline / (muscle_max - muscle_min)) * 0.75 * (muscle_max * 0.75 - _this.message.smm)).toFixed(1);
                _this.message.smmline = smmline;
                _this.btn.smmline.width = smmline + 'mm';
                _this.btn.line_smm.left = smmline + parseFloat(_this.coordinate.line_smm_x) + 'mm';
                //体质指数
                let bmiline = totalline - ((normalline / (23.9 - 18.5)) * (23.9 - _this.message.bmi)).toFixed(1);
                _this.message.bmiline = bmiline;
                _this.btn.bmiline.width = bmiline + 'mm';
                _this.btn.line_bmi.left = bmiline + parseFloat(_this.coordinate.line_bmi_x) + 'mm';
                //腰臀比
                let whrline = totalline - ((normalline / (whr_max - whr_min)) * (whr_max - _this.message.whr)).toFixed(1);
                _this.message.whrline = whrline;
                _this.btn.whrline.width = whrline + 'mm';
                _this.btn.line_whr.left = whrline + parseFloat(_this.coordinate.line_whr_x) + 'mm';
                //内脏指数
                let vfiline = totalline - (normalline / (5 * (10 - _this.message.vfi))).toFixed(1);
                _this.message.vfiline = vfiline;
                _this.btn.vfiline.width = vfiline + 'mm';
                _this.btn.line_vfi.left = vfiline + parseFloat(_this.coordinate.line_vfi_x) + 'mm';
            }
        }
    }
});