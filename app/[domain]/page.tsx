import { AppBskyActorDefs } from "@atproto/api"
import { Check, X } from "lucide-react"

import { agent } from "@/lib/atproto"
import { prisma } from "@/lib/db"
import { hasExplicitSlur } from "@/lib/slurs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Profile } from "@/components/profile"
import { Stage } from "@/components/stage"

export function generateMetadata({ params }: { params: { domain: string } }) {
  const domain = params.domain
  return {
    title: `${domain} - get your community handle for Bluesky`,
    description: `get your own ${domain} handle`,
  }
}

export default async function IndexPage({
  params,
  searchParams,
}: {
  params: {
    domain: string
  }
  searchParams: {
    handle?: string
    "new-handle"?: string
  }
}) {
  const domain = params.domain
  let handle = searchParams.handle
  let newHandle = searchParams["new-handle"]
  let profile: AppBskyActorDefs.ProfileView | undefined
  let error1: string | undefined
  let error2: string | undefined

  if (handle) {
    try {
      if (!handle.includes(".")) {
        handle += ".bsky.social"
      }
      console.log("fetching profile", handle)
      const actor = await agent.getProfile({
        actor: handle,
      })
      if (!actor.success) throw new Error("fetch was not a success")
      profile = actor.data
    } catch (e) {
      console.error(e)
      error1 = (e as Error)?.message ?? "unknown error"
    }

    if (newHandle && profile) {
      newHandle = newHandle.trim().toLowerCase()
      if (!newHandle.includes(".")) {
        newHandle += "." + domain
      }
      if (!error1) {
        // regex: (alphanumeric, -, _).(domain)
        const validHandle = newHandle.match(
          new RegExp(`^[a-zA-Z0-9-_]+.${domain}$`)
        )
        if (validHandle) {
          try {
            const handle = newHandle.replace(`.${domain}`, "")
            if (hasExplicitSlur(handle)) {
              throw new Error("slur")
            }

            if (domain === "army.social" && RESERVED.includes(handle)) {
              throw new Error("reserved")
            }

            const existing = await prisma.user.findFirst({
              where: { handle },
              include: { domain: true },
            })
            if (existing && existing.domain.name === domain) {
              if (existing.did !== profile.did) {
                error2 = "handle taken"
              }
            } else {
              await prisma.user.create({
                data: {
                  handle,
                  did: profile.did,
                  domain: {
                    connectOrCreate: {
                      where: { name: domain },
                      create: { name: domain },
                    },
                  },
                },
              })
            }
          } catch (e) {
            console.error(e)
            error2 = (e as Error)?.message ?? "unknown error"
          }
        } else {
          error2 = "invalid handle"
        }
      }
    }
  }

  return (
    <main className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-4">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
          Get your own {domain} <br className="hidden sm:inline" />
          handle for Bluesky
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
          Follow the instructions below to get your own {domain} handle
        </p>
        <div className="mt-2 text-base">
          Brought to you by <a href="https://bsky.app/profile/urbanism.plus" target="_blank" rel="noopener noreferrer" className="font-bold text-lg underline hover:text-primary">Urbanism+</a>
        </div>
        <div className="mt-4 flex gap-2 text-sm">
          <span className="text-muted-foreground">More free handles:</span>
          {domain !== "bancars.city" && (
            <a href="https://bancars.city" className="font-medium hover:underline">bancars.city</a>
          )}
          {domain !== "carfree.life" && (
            <a href="https://carfree.life" className="font-medium hover:underline">carfree.life</a>
          )}
          {domain !== "on.bike" && (
            <a href="https://on.bike" className="font-medium hover:underline">on.bike</a>
          )}
        </div>
      </div>
      <div>
        <Stage title="Enter your current handle" number={1}>
          <form>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <div className="flex w-full max-w-sm items-center space-x-2">
                {newHandle && (
                  <input type="hidden" name="new-handle" value="" />
                )}
                <Input
                  type="text"
                  name="handle"
                  placeholder="example.bsky.social"
                  defaultValue={handle}
                  required
                />
                <Button type="submit">Submit</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter your current handle, not including the @
              </p>
              {error1 && (
                <p className="flex flex-row items-center gap-2 text-sm text-red-500">
                  <X className="size-4" /> Handle not found - please try again
                </p>
              )}
              {profile && (
                <>
                  <p className="text-muted-forground mt-4 flex flex-row items-center gap-2 text-sm">
                    <Check className="size-4 text-green-500" /> Account found
                  </p>
                  <Profile profile={profile} className="mt-4" />
                </>
              )}
            </div>
          </form>
        </Stage>
        <Stage title="Choose your new handle" number={2} disabled={!profile}>
          <form>
            <input type="hidden" name="handle" value={handle} />
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  type="text"
                  name="new-handle"
                  placeholder={`example.${domain}`}
                  defaultValue={newHandle}
                />
                <Button type="submit">Submit</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter the {domain} handle that you would like to have, not
                including the @
              </p>
              {error2 && (
                <p className="text-sm text-red-500">
                  {(() => {
                    switch (error2) {
                      case "handle taken":
                        return "Handle already taken - please enter a different handle"
                      case "invalid handle":
                      case "slur":
                        return "Invalid handle - please enter a different handle"
                      case "reserved":
                        return "Reserved handle - please enter a different handle"
                      default:
                        return "An error occured - please try again"
                    }
                  })()}
                </p>
              )}
            </div>
          </form>
        </Stage>
        <Stage
          title="Change your handle within the Bluesky app"
          number={3}
          disabled={!newHandle || !!error2}
          last
        >
          <p className="max-w-lg text-sm">
            Go to Settings {">"} Advanced {">"} Change my handle. Select &quot;I
            have my own domain&quot; and enter{" "}
            {newHandle ? `"${newHandle}"` : "your new handle"}. Finally, tap
            &quot;Verify DNS Record&quot;.
          </p>
          <p className="mt-6 max-w-lg text-sm">
            If you like this project, consider{" "}
            <a href="https://github.com/sponsors/mozzius" className="underline">
              sponsoring my work
            </a>
            .
          </p>
        </Stage>
      </div>
      <div className="mt-8 rounded-lg border bg-muted/50 p-6">
        <h3 className="font-semibold mb-2">💚 Support Community Handles</h3>
        <p className="text-sm text-muted-foreground mb-3">
          These domains cost money to maintain. We&apos;re raising $125 to cover next year&apos;s costs. 
          Any extra funds go towards more community handles and urbanism projects.
        </p>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">$0 / $125</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{width: '0%'}}></div>
          </div>
        </div>
        <a 
          href="https://ko-fi.com/urbanismplus/goal?g=0" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
        >
          Support on Ko-fi
        </a>
      </div>
    </main>
  )
}

const RESERVED = [
  "Jungkook",
  "JeonJungkook",
  "Jeon",
  "JK",
  "JJK",
  "Kim",
  "KimTaehyung",
  "V",
  "Taehyung",
  "Tae",
  "Jin",
  "Seokjin",
  "KimSeokjin",
  "RM",
  "Namjoon",
  "Nam",
  "KimNamjoon",
  "MinYoongi",
  "Yoongi",
  "Yoon",
  "AgustD",
  "MYG",
  "Suga",
  "PJM",
  "Jimin",
  "ParkJimin",
  "Park",
  "Abcdefghi__lmnopqrsvuxyz",
  "JM",
  "UarMyHope",
  "Rkrive",
  "THV",
  "KTH",
  "SBT",
  "BANGPD",
  "projeto",
  "army",
  "armys ",
  "info",
  "projects",
  "Pic",
  "New",
  "Babys",
].map((x) => x.toLowerCase())
