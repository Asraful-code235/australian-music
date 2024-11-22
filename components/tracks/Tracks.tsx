"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Command } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Music, Plus, Loader2 } from "lucide-react";
import { Track } from "@/types/track";
import { TrackItem } from "./TrackItem";
import { toast } from "sonner";

export default function TracksPage() {
  const { data: session, status } = useSession();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session) {
      loadPlaylist();
    }
  }, [session]);

  const loadPlaylist = async () => {
    try {
      const response = await fetch("/api/playlists");
      const data = await response.json();
      if (data.tracks) {
        setTracks(data.tracks);
      }
    } catch (error) {
      toast.error("Failed to load playlist");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setTracks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newTracks = arrayMove(items, oldIndex, newIndex).map(
          (track, index) => ({
            ...track,
            position: index + 1,
          })
        );
        return newTracks;
      });

      // Save the new order
      await handleSavePlaylist();
    }
  };

  const handleAddTrack = () => {
    if (!search.trim()) return;

    const newTrack: Track = {
      id: Date.now().toString(),
      title: search,
      artist: "",
      releaseDate: "",
      isCustom: true,
      position: tracks.length + 1,
    };

    setTracks([...tracks, newTrack]);
    setSearch("");
  };

  const handleUpdateTrack = async (updatedTrack: Track) => {
    const newTracks = tracks.map((track) =>
      track.id === updatedTrack.id ? updatedTrack : track
    );
    setTracks(newTracks);
    await handleSavePlaylist();
  };

  const handleSavePlaylist = async () => {
    if (!session) {
      toast.error("Please sign in to save your playlist");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tracks }),
      });

      if (!response.ok) throw new Error("Failed to save playlist");

      toast.success("Playlist saved successfully");
    } catch (error) {
      toast.error("Failed to save playlist");
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
        <p className="text-gray-600">
          You need to be signed in to create and save playlists.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Create Your Top 20 Tracks</h1>

        <div className="relative">
          <Command className="rounded-lg border shadow-md">
            <div className="flex items-center border-b px-3">
              <Music className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Search or create a track..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </Command>

          {search && (
            <div className="absolute w-full bg-white rounded-b-lg border border-t-0 shadow-lg">
              <div className="p-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleAddTrack}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create &quot;{search}&quot;
                </Button>
              </div>
            </div>
          )}
        </div>

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tracks}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {tracks.map((track) => (
                <TrackItem
                  key={track.id}
                  track={track}
                  onUpdate={handleUpdateTrack}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {tracks.length > 0 && (
          <Button
            className="w-full"
            onClick={handleSavePlaylist}
            disabled={tracks.length !== 20 || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : tracks.length === 20 ? (
              "Save Playlist"
            ) : (
              `Add ${20 - tracks.length} more tracks`
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
