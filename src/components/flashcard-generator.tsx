'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Wand2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMindPalace } from '@/contexts/mind-palace-context';
import { generateFlashcardsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  topic: z
    .string()
    .min(2, 'Set name must be at least 2 characters.')
    .max(100, 'Set name must be at most 100 characters.'),
  content: z
    .string()
    .max(400000, 'Content must be at most 400,000 characters.')
    .optional(),
  numFlashcards: z.coerce.number().min(5).max(100),
  frontTextLength: z.enum(['short', 'medium', 'long']),
  backTextLength: z.enum(['short', 'medium', 'long']),
});

type FormValues = z.infer<typeof formSchema>;

export function FlashcardGenerator() {
  const [isPending, startTransition] = useTransition();
  const { createSet } = useMindPalace();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      content: '',
      numFlashcards: 10,
      frontTextLength: 'short',
      backTextLength: 'medium',
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      // If content is provided, use it. Otherwise, use the topic.
      const generationSource = values.content || values.topic;

      const result = await generateFlashcardsAction({
        topic: generationSource,
        numFlashcards: values.numFlashcards,
        frontTextLength: values.frontTextLength,
        backTextLength: values.backTextLength,
      });

      if (result.success && result.data) {
        // Use the user-provided topic for the set name
        createSet(values.topic, result.data);
        toast({
          title: 'Flashcard Set Created!',
          description: `Your new set "${values.topic}" is ready.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Generation Failed',
          description:
            result.error ||
            'The AI could not generate flashcards for this topic. Please try a different one.',
        });
      }
    });
  }

  return (
    <div className="container mx-auto flex max-w-2xl flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Welcome to FlashcardAI
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Create a new set of flashcards using AI to start your learning
          journey.
        </p>
      </div>
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Wand2 className="h-6 w-6 text-primary" />
            Create a New Flashcard Set with AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Set Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Chapter 1: The Roman Empire"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Give your new flashcard set a name. The AI will use this
                      if no content is provided.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Content to Generate From (Optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your chapter text or a long article here..."
                        className="h-48"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The AI will generate flashcards based on this text. If
                      left blank, it will use the set name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numFlashcards"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Flashcards</FormLabel>
                    <FormControl>
                      <Input type="number" min="5" max="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="frontTextLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Front Text Length</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select length" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="long">Long</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="backTextLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Back Text Length</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select length" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="long">Long</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full"
                size="lg"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  'Generate Flashcards'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
