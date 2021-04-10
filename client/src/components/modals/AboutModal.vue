<template>
  <div class="modal" :class="{ 'is-active': active }">
    <div class="modal-background" @click="close"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">About Geppetto</p>
      </header>
      <section class="modal-card-body">
        <div class="content">
          <p>
            &copy;2020. Triad National Security, LLC. All rights reserved.
          </p>
          <p>
            This program was produced under U.S. Government contract
            89233218CNA000001 for Los Alamos National Laboratory (LANL), which
            is operated by Triad National Security, LLC for the U.S. Department
            of Energy/National Nuclear Security Administration.
          </p>
          <p>
            All rights in the program are reserved by Triad National Security,
            LLC, and the U.S. Department of Energy/National Nuclear Security
            Administration. The Government is granted for itself and others
            acting on its behalf a nonexclusive, paid-up, irrevocable worldwide
            license in this material to reproduce, prepare derivative works,
            distribute copies to the public, perform publicly and display
            publicly, and to permit others to do so.
          </p>
          <p>
            This program is based on the DARPA MediFor system (<a
              href="https://mediforprogram.com/"
              target="_blank"
              >mediforprogram.com</a
            >).
          </p>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button class="button is-primary" @click="close">Close</button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: "AboutModal",

  props: {
    active: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    close() {
      this.$emit("update:active", false);
    }
  }
};
</script>
