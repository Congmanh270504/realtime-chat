import { RedirectToSignIn } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";
import { MessageSquare, Users, Zap, Shield, Globe, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import AddFriendDialog from "@/components/ui/add-friend-dialog";

const Page = async () => {
  const user = await currentUser();
  if (!user) {
    return <RedirectToSignIn />;
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 overflow-y-auto">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 pb-24">
        <div className="text-center mb-16">
          <div className=" flex justify-center items-center mb-6 gap-2">
            {/* <MessageSquare className="h-16 w-16 text-blue-600 mr-4" /> */}
            <Image
              src="/ChatGPT-Image.png"
              width={64}
              height={64}
              alt="Chat App"
              className="rounded-lg"
            />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Chat App
            </h1>
          </div>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-2">
            Welcome{" "}
            <span className="font-semibold text-blue-600">
              {user.username || user.fullName}
            </span>
            !
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Connect with friends, share moments and chat in real-time with ease
            and security
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <Zap className="h-8 w-8 text-yellow-500 mr-3" />
              <h3 className="text-xl font-semibold">Realtime Chat</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Messages sent and received instantly with modern WebSocket
              technology
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <Users className="h-8 w-8 text-green-500 mr-3" />
              <h3 className="text-xl font-semibold">Easy Friendship</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Search and connect with other users, manage your friends list
              efficiently
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-blue-500 mr-3" />
              <h3 className="text-xl font-semibold">High Security</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Protected by Clerk Authentication and end-to-end encryption
            </p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <Globe className="h-8 w-8 text-purple-500 mr-3" />
              <h3 className="text-xl font-semibold">Server Chat</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Create and join chat servers for topic-based group discussions
            </p>
            <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <li>• Create private servers</li>
              <li>• Manage members</li>
              <li>• Real-time group chat</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <Heart className="h-8 w-8 text-red-500 mr-3" />
              <h3 className="text-xl font-semibold">Special Features</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Unique features for the best chat experience
            </p>
            <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <li>• Set nicknames for friends</li>
              <li>• Real-time online status</li>
              <li>• New message notifications</li>
              <li>• Dark/light mode interface</li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Start Chatting Now!</h2>
          <p className="text-xl mb-6 opacity-90">
            Connect with friends and explore the world of real-time chat
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* <Link href="/add-friends">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                <Users className="mr-2 h-5 w-5" />
                Add Friends
              </Button>
            </Link> */}
            <AddFriendDialog
              triggerClassName="text-lg px-8 bg-white/10 border-white/30 text-white hover:bg-white/20"
              text="Add Friends"
              size="lg"
            />
            <Link href="/messages">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                View Messages
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                Real-time
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Instant messaging
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                Secure
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                High security
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                Easy
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Easy to use
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
