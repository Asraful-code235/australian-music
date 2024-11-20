"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GripVertical, Save, Edit, X } from "lucide-react";
import { Track } from "@/types/track";

interface TrackItemProps {
  track: Track;
  onUpdate: (track: Track) => void;
}

export function TrackItem({ track, onUpdate }: TrackItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTrack, setEditedTrack] = useState(track);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    onUpdate(editedTrack);
    setIsEditing(false);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-4 flex items-center gap-4"
    >
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>

      {isEditing ? (
        <div className="flex-1 grid grid-cols-3 gap-4">
          <Input
            placeholder="Title"
            value={editedTrack.title}
            onChange={(e) =>
              setEditedTrack({ ...editedTrack, title: e.target.value })
            }
          />
          <Input
            placeholder="Artist"
            value={editedTrack.artist}
            onChange={(e) =>
              setEditedTrack({ ...editedTrack, artist: e.target.value })
            }
          />
          <Input
            type="date"
            value={editedTrack.releaseDate}
            onChange={(e) =>
              setEditedTrack({ ...editedTrack, releaseDate: e.target.value })
            }
          />
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-3 gap-4">
          <span className="truncate">{track.title}</span>
          <span className="truncate">{track.artist}</span>
          <span>{track.releaseDate}</span>
        </div>
      )}

      <div className="flex gap-2">
        {isEditing ? (
          <>
            <Button size="icon" variant="ghost" onClick={handleSave}>
              <Save className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsEditing(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
