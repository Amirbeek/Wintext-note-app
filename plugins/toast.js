import Vue from 'vue';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

export default (ctx, inject) => {
    Vue.use(Toast);
    inject('toast', Vue.$toast);
}
