const Config = require('Config');

cc.Class({
    extends: cc.Component,

    properties: {
        wheelSp: { //轉盤
            default: null,
            type: cc.Sprite
        },
        maxSpeed: { //轉盤旋轉時到達的最高速
            default: 5, //預設
            type: cc.Float,
            max: 15, //最大值
            min: 2, //最小值
        },
        duration: { //减速前旋转时间
            default: 3,
            type: cc.Float,
            max: 5,
            min: 1,
            tooltip: "减速前旋转时间"
        },
        acc: { //加速度
            default: 0.1,
            type: cc.Float,
            max: 0.2,
            min: 0.01,
            tooltip: "加速度"
        },
        targetID: {
            default: 0,
            type: cc.Integer,
            max: 17,
            min: 0,
            tooltip: "指定结束时的齿轮"
        },
        springback: {
            default: false,
            tooltip: "旋转结束是否回弹"
        },

        messageLabel: cc.Label,
    },


    onLoad() {
        cc.log("....onload");
        this.wheelState = 0; //初始轉盤狀態
        this.curSpeed = 0; //當前速度初始為0
        this.spinTime = 0; //减速前旋转时间
        this.gearNum = 18; //總共18格
        this.defaultAngle = 360 / 18 / 2; //修正默认角度(對應轉盤輪圖形)
        this.gearAngle = 360 / this.gearNum; //每个齿轮的角度(對應轉盤輪圖形)
        //Node.angle 该节点的旋转角度，正值为逆时针方向。
        this.wheelSp.node.angle = this.defaultAngle;
        //this.wheelSp.node.angle = 90;
        this.finalAngle = 0; //最终结果指定的角度
        this.effectFlag = 0; //用于音效播放
        this.turnFlag = false;
        //隨機決定轉盤最後是否回彈
        Math.random() > 0.5 ? this.springback = true : this.springback = false;
        cc.log('this.springback: ' + this.springback);
        this.messageLabel.string = `祝您中大獎`;
        this.isEdit = false; //判斷是否手動編輯過targetID

    },

    start() {
        //this.bg_audio = cc.audioEngine.play(this.bgAudio, true, 0.3);
        // 播放背景音樂
        cc.loader.loadRes('bgm', cc.AudioClip, function(err, clip) {
            cc.audioEngine.play(clip, true, 0.3);
        });
    },

    // caculateFinalAngle: function(targetID) {
    //     this.finalAngle = 360 - (18 - this.targetID) * this.gearAngle + this.defaultAngle;
    //     if (this.springback) {
    //         this.finalAngle += this.gearAngle;
    //     }
    // },
    editBoxDidBegin(edit) { //點擊編輯區會清空該區
        edit.string = '';
    },

    editBoxDidChanged(text) {

    },

    editBoxDidEndEditing(edit) { //編輯結束時
        var res = parseInt(edit.string);
        if (isNaN(res)) { //檢查是曾為數字
            if (cc.sys.isBrowser) { //檢查是否為瀏覽器
                //alert('please input a number!');
                edit.string = '';
            } else {
                //cc.log(".....invalid input");
                edit.string = '';
            }
            //若輸入值無意義，則隨機給一組ID
            this.targetID = Math.round(Math.random() * (this.gearNum - 1));
            this.isEdit = true;
            return;
        } else if (parseInt(edit.string) < 0 || parseInt(edit.string) > 17) {
            edit.string = '';
            this.targetID = Math.round(Math.random() * (this.gearNum - 1));
            this.isEdit = true;
        }
        //若正常輸入的話則直接賦值
        this.targetID = res;
        this.isEdit = true;
        cc.log('targetID: ' + this.targetID);
    },

    wheelTurn() { //轉盤旋轉
        //this.nowdt++;
        cc.log("begin spin");
        if (this.wheelState !== 0) { //只有最初的狀態，按下才有反應
            return;
        }
        if (!this.turnFlag) { //設定狀態為旋轉中
            this.turnFlag = true;
        }
        if (this.isEdit === false) { //若玩家未手動輸入ID，則隨機給
            this.targetID = Math.round(Math.random() * (this.gearNum - 1));
            cc.log('targetID: ' + this.targetID);
            //this.isEdit = true;
        }

        this.decAngle = 2 * 360; // 减速旋转两圈
        this.wheelState = 1; //設定旋轉狀態
        this.curSpeed = 0; //初始速度為0
        this.spinTime = 0; //初始旋轉時間為0
        this.maxSpeed = 12; //設定最大旋轉速度
        this.messageLabel.string = `祝您中大獎`;
        //隨機決定轉盤最後是否回彈
        Math.random() > 0.5 ? this.springback = true : this.springback = false;
        cc.log('this.springback: ' + this.springback);
        //this.messageLabel.string = `旋轉中...`;
    },

    showRes() { //演示結果
        // var Config = require("Config");
        let message = `恭喜得到 ${Config.gearInfo[this.targetID]} 的獎項`
        this.messageLabel.string = message;
        //this.isEdit = false;
        if (cc.sys.isBrowser) {
            alert(message);
        } else cc.log(message);
    },

    update(dt) { //
        if (this.wheelState === 0) {
            return;
        }
        // cc.log('......update');
        // cc.log('......state=%d',this.wheelState);

        // 每經過一個角度時，播放一聲旋轉音效
        this.effectFlag += this.curSpeed;
        if (Math.abs(this.effectFlag) >= Math.abs(this.gearAngle)) {

            if (this.audioID) {
                // cc.audioEngine.pauseEffect(this.audioID);
            }
            // this.audioID = cc.audioEngine.playEffect(this.effectAudio,false);
            //this.audioID = cc.audioEngine.playEffect(cc.url.raw('resources/Sound/game_turntable.mp3'));
            //this.audioID = cc.audioEngine.play(this.effectAudio, false, 0.5);
            //這裡更用loadRes的方式，配合iphone手機(原方式iphone登入遊戲會卡住)
            this.audioID = cc.loader.loadRes('pass', cc.AudioClip, function(err, clip) {
                cc.audioEngine.play(clip, false, 0.5);
            });
            this.effectFlag = 0;
        }

        if (this.wheelState == 1) { //處理旋轉程序
            //cc.log('....加速,speed:' + this.curSpeed);
            this.spinTime += dt;
            //Node.angle 该节点的旋转角度，正值为逆时针方向。
            this.wheelSp.node.angle -= this.curSpeed; //加速
            if (this.curSpeed <= this.maxSpeed) { //當前速度增加小於最高速，此為加速階段
                this.curSpeed += this.acc; //this.acc加速度為0.1，由面板輸入
            } else { //恆速階段
                if (this.spinTime < this.duration) { // this.duration 减速前旋转时间
                    return;
                }
                // cc.log('....开始减速');
                //设置目标角度
                //this.gearAngle每个齿轮的角度
                //this.targetID 索引值
                // 因為是順時針，所以要用360去減
                //this.defaultAngle為修正默认角度(圖的原點)
                //this.finalAngle = 360 - this.targetID * this.gearAngle + this.defaultAngle;
                //原程式使用rotation，我改成angle，所以finalAngle算法有對應修改
                //這句算是核心了
                //最後角度 = 360度 - ((18格-目標格數-1) * 每格角度) + 對應圖形的偏移角度 
                this.finalAngle = 360 - (18 - this.targetID + 1) * this.gearAngle + this.defaultAngle;
                cc.log('this.finalAngle: ' + this.finalAngle);
                this.maxSpeed = this.curSpeed;
                if (this.springback) { //this.springback 旋转结束是否回弹
                    this.finalAngle += this.gearAngle;
                }
                //這裡已經先把轉盤 賦值為最後的角度了，畫面看的到頓一下下，但會有是轉盤減速停頓的錯覺
                this.wheelSp.node.angle = this.finalAngle;
                //更改轉盤狀態為減速階段
                this.wheelState = 2;
            }
        } else if (this.wheelState == 2) { //減速階段
            //cc.log('......减速,speed:' + this.curSpeed);
            //當前角度
            var curRo = this.wheelSp.node.angle;
            //hadRo 差多少角度到finalAngle
            var hadRo = curRo - this.finalAngle; //現在角度-最後的角度
            //逐漸減速，this.decAngle = 2 * 360;
            //hadRo每幀會變動，所以速度會慢慢改變            
            this.curSpeed = this.maxSpeed * ((this.decAngle + hadRo) / this.decAngle) + 0.2;
            this.wheelSp.node.angle = curRo - this.curSpeed;
            // cc.log('curRo: ' + curRo);
            // cc.log('hadRo: ' + hadRo);
            // cc.log('decAngle: ' + this.decAngle);
            // cc.log('angle: ' + this.wheelSp.node.angle);

            // this.decAngle = 360*2，减速旋转两圈
            if ((this.decAngle + hadRo) <= 0) { //當減速2圈轉完後，hadRo應為-720度
                cc.log('....停止');
                this.wheelState = 0;
                this.wheelSp.node.angle = this.finalAngle;

                if (this.springback) { //倒转一个齿轮
                    //this.springback為true時，初始設定時即有多加一個this.gearAngle, 所以可以安心倒轉                    
                    // var act = new cc.rotateBy(0.6, -this.gearAngle);
                    //this.audioID = cc.audioEngine.play(this.effectAudio, false, 0.5);
                    this.audioID = cc.loader.loadRes('pass', cc.AudioClip, function(err, clip) {
                        cc.audioEngine.play(clip, false, 0.5);
                    });
                    //演示倒轉動動畫
                    let act = cc.rotateBy(1.6, -this.gearAngle);
                    //var seq = cc.sequence(cc.delayTime(0.2), act, cc.callFunc(this.showRes, this));
                    let seq = cc.sequence(cc.delayTime(0.05), act, cc.callFunc(this.showRes, this));
                    this.wheelSp.node.runAction(seq);
                } else {
                    this.showRes();
                    cc.log('rotation OK');
                }
            }
        }
    },

});