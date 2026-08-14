"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {

const supabase = createClient();
const router = useRouter();

const [password,setPassword] = useState("");
const [message,setMessage] = useState("");


async function updatePassword(){

const {error}=await supabase.auth.updateUser({
password
});


if(error){
setMessage(error.message);
return;
}


setMessage("Password updated successfully!");

setTimeout(()=>{
router.push("/login");
},1500);

}


return (

<main className="min-h-screen bg-black text-white flex items-center justify-center p-6">

<div className="w-full max-w-md space-y-5">

<h1 className="text-3xl font-bold text-purple-500">
Create New Password
</h1>


<input
type="password"
placeholder="New Password"
className="w-full rounded border p-3 text-black"
value={password}
onChange={(e)=>setPassword(e.target.value)}
/>


<button
onClick={updatePassword}
className="w-full rounded bg-purple-600 p-3"
>
Update Password
</button>


{message &&
<p>{message}</p>
}


</div>

</main>

)

}