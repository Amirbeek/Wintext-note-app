<template>
  <div class=" flex bg-zinc-900  h-screen">

    <!--  sidebar  -->
    <div class="bg-black w-[516px] p-12 flex flex-col justify-center">
      <Logo/>
      <h1 class="text-white font-bold text-lg mt-8">Login in to your account</h1>
      <p class="text-zinc-300  text-sm">don't you have an account?
        <nuxt-link to="register" class="font-bold text-[#FFAC00] underline">Sign up</nuxt-link>
       for one
      </p>
      <form @submit.prevent="submit">
        <div class="mt-8">
          <label for="" class="text-zinc-300 text-sm font-normal block mb-0.5">Email Address</label>
          <input
              v-model="email"
              type="email"
              class="form-control block w-full bg-[#27272A] border border-[#3F3F46] rounded text-white px-4 py-2 placeholder:text-zinc-500 text-sm"
              placeholder="you@example.com"
              required
          >

        </div>
        <div class="mt-8">
          <label for="" class="text-zinc-300 text-sm font-normal block mb-0.5">Password</label>
          <input
              type="password"
              v-model="password"

              class="form-control block w-full bg-[#27272A] border border-[#3F3F46] rounded text-white px-4 py-2 placeholder:text-zinc-500 text-sm"
              placeholder="*********"
              required
          >
        </div>
        <!--   sign button   -->
        <div>
          <button class="w-full mt-4 bg-[#FFAC00] rounded-full px-4 py-2 text-sm font-bold flex  justify-center items-center space-x-2">
            <span> Log in</span>
            <span><ArrorwRight/></span>
          </button>
        </div>
      </form>


    </div>


    <!--  sidebar  -->
    <div class="flex h-screen justify-center items-center bg-black w-full">
      <!-- Parent div centered in the middle -->
      <div class="w-[500px]">
        <AnimatedLorem />
      </div>
    </div>
    <!--    node introduction-->
  </div>

</template>
<script setup lang="ts">
import ArrorwRight from "~/components/ArrorwRight.vue";
import {$fetch} from "ofetch";
const email = ref('')
const password = ref('')
import Swal from 'sweetalert2'

async function submit() {
  try {
    await  $fetch('api/login',{
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    const { isConfirmed } = await Swal.fire({
      title: "Success!",
      text: "Account Created successfully",
      icon: "success",
      confirmButtonText: "OK",
    })

    if(isConfirmed){
      navigateTo('/')
    }

  } catch (error) {
    const err = error as { response?: { _data?: { message?: string } } };
    await Swal.fire({
      title: "Error!",
      text: err.response?._data?.message || "An unexpected error occurred",
      icon: "error",
      confirmButtonText: "OK",
    })
  }
}
</script>