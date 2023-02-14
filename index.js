// 1.取得產品列表
// 2.按按鈕，顯示單一產品細節
// 3.加入購物車
// 4.購物車列表
// 5.調整數量
// 6.刪除品項

const apiPath = "zxcv123";

// VeeValidation將全部規則加入(CDN版本)
Object.keys(VeeValidateRules).forEach((rule) => {
  if (rule !== "default") {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});

// 讀取外部的資源，加入多國語系要記得先建zh_TW.json檔案
VeeValidateI18n.loadLocaleFromURL("./zh_TW.json");

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize("zh_TW"),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

// productModal元件
const productModal = {
  // id為自定義名稱，當id變動時，取得遠端資料、自定義名稱將addToCart方法傳入
  props: ["id", "addToCart", "openModal"],
  data() {
    return {
      modal: {},
      tempProduct: {}, // 自定義名稱
      qty: 1, //定義預設值
    };
  },
  // 用watch監聽props傳入的id值，取得單一產品資訊並打開單一產品modal
  watch: {
    id() {
      // console.log("productModal:", this.id); // 測試id是否有傳入
      if (this.id) {
        // id有值的時候才會跑以下程式碼
        axios
          .get(
            `https://vue3-course-api.hexschool.io/v2/api/${apiPath}/product/${this.id}`
          )
          .then((response) => {
            this.tempProduct = response.data.product;
            // console.log("單一產品:", this.tempProduct); 測試用
            this.modal.show();
          })
          .catch((error) => {
            alert(error.data.message);
          });
      }
    },
  },
  template: "#userProductModal",
  methods: {
    hide() {
      this.modal.hide();
    },
  },
  mounted() {
    // 將bootstrap的modal實體化，用refs或id的方式都可以this.modal = new bootstrap.Modal(document.querySelector("#productModal"));
    this.modal = new bootstrap.Modal(this.$refs.modal);
    // this.modal.show(); 測試是否可以展開

    // 監聽DOM，當Modal關閉時要做其他事情
    this.$refs.modal.addEventListener("hidden.bs.modal", (event) => {
      // watch監聽id變動才會打開modal所以當連續點擊第二次相同id就不會打開(因為id沒變動)
      // 所以在關閉modal時把id先清空
      this.openModal("");
    });
  },
};

const app = Vue.createApp({
  data() {
    return {
      // apiPath: "zxcv123",
      products: [], // 產品列表
      productId: "",
      cart: [], // 購物車列表
      loadingItem: "", // 存id，當id存在時就不能操作
      addCartLoading: null, // 設定loading效果用的，點擊加入購物車會先將id傳入之後再清空
      data: {
        user: {
          email: "",
          name: "",
          tel: "",
          address: "",
        },
        message: "",
      },
    };
  },
  methods: {
    getProducts() {
      axios
        .get(`https://vue3-course-api.hexschool.io/v2/api/${apiPath}/products`)
        .then((response) => {
          this.products = response.data.products;
          // console.log("產品列表:", this.products); 測試用
        })
        .catch((error) => {
          alert(error.data.message);
        });
    },
    openModal(id) {
      this.productId = id;
      // console.log("外層帶入id", id); 測試用
    },
    addToCart(product_id, qty = 1) {
      //需要傳入後端的資料格式，qty=1當沒有傳入該參數時，預設值為1
      const data = {
        product_id,
        qty,
      };
      this.addCartLoading = product_id; // 加入購物車先傳入id顯示loading效果用
      axios
        .post(
          `https://vue3-course-api.hexschool.io/v2/api/${apiPath}/cart`,
          { data } // {data:data}的縮寫，因為要傳入的資料格式是物件裡帶入data，所以要加括號
        )
        .then((response) => {
          alert(response.data.message);
          this.$refs.productModal.hide();
          this.getCarts();
          this.addCartLoading = null; // 清除id下次點擊比對id才能顯示loading效果
        })
        .catch((error) => {
          alert(error.data.message);
        });
    },
    getCarts() {
      // 可以另外做區塊或全畫面讀取效果

      axios
        .get(`https://vue3-course-api.hexschool.io/v2/api/${apiPath}/cart`)
        .then((response) => {
          this.cart = response.data.data;
          // console.log("購物車列表:", this.cart); 測試用
          // console.log(this.cart.carts.length); 測試用
        })
        .catch((error) => {
          alert(error.data.message);
        });
    },
    updateCartItem(item) {
      // 需要傳入後端的資料格式，data裡要帶的是產品id
      const data = {
        data: {
          product_id: item.product.id,
          qty: item.qty,
        },
      };
      // console.log(data, item.id); 測試用

      // 將id存起來
      this.loadingItem = item.id;

      // put裡要帶的是購物車id
      axios
        .put(
          `https://vue3-course-api.hexschool.io/v2/api/${apiPath}/cart/${item.id}`,
          data
        )
        .then((response) => {
          // console.log("更新購物車列表:", response.data); 測試用
          alert(response.data.message);
          this.getCarts();

          // 結束時再清空id
          this.loadingItem = "";
        })
        .catch((error) => {
          alert(error.data.message);
        });
    },
    deleteCartItem(item) {
      // 將id存起來
      this.loadingItem = item.id;

      // delete裡要帶的是購物車id
      axios
        .delete(
          `https://vue3-course-api.hexschool.io/v2/api/${apiPath}/cart/${item.id}`
        )
        .then((response) => {
          // console.log("刪除購物車列表:", response.data); 測試用
          alert(response.data.message);
          this.getCarts();

          // 結束時再清空id
          this.loadingItem = "";
        })
        .catch((error) => {
          alert(error.data.message);
        });
    },
    deleteAllCarts() {
      axios
        .delete(`https://vue3-course-api.hexschool.io/v2/api/${apiPath}/carts`)
        .then((response) => {
          // console.log("刪除全部購物車列表:", response.data); 測試用
          alert(response.data.message);
          this.getCarts();
        })
        .catch((error) => {
          alert(error.data.message);
        });
    },
    onSubmit() {
      // 先把表單資料賦予到一個變數再使用
      const data = this.data;
      axios
        .post(
          `https://vue3-course-api.hexschool.io/v2/api/${apiPath}/order`,
          { data } // {data:data}的縮寫，因為要傳入的資料格式是物件裡帶入data，所以要加括號
        )
        .then((response) => {
          alert(response.data.message);

          // 將表單資料清空
          this.$refs.form.resetForm();
          this.getCarts();
        })
        .catch((error) => {
          alert(error.data.message);
        });
    },
  },
  components: {
    productModal,
  },
  mounted() {
    this.getProducts(); // 進入頁面先取得產品列表
    this.getCarts(); // 進入頁面先取得購物車列表
  },
});

// 將VeeValidation註冊全域元件
app.component("VForm", VeeValidate.Form);
app.component("VField", VeeValidate.Field);
app.component("ErrorMessage", VeeValidate.ErrorMessage);
app.mount("#app");
