import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import './App.css'

function App() {
  const [submittedData, setSubmittedData] = useState<any>(null)

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
    },
    onSubmit: async ({ value }) => {
      setSubmittedData(value)
    },
  })

  return (
    <div>
      <h1>TanStack Form Example</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div>
          <form.Field
            name="firstName"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? 'A first name is required'
                  : value.length < 3
                  ? 'First name must be at least 3 characters'
                  : undefined,
            }}
            children={(field) => (
              <>
                <label htmlFor={field.name}>First Name:</label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors ? (
                  <em>{field.state.meta.errors.join(', ')}</em>
                ) : null}
              </>
            )}
          />
        </div>
        <div>
          <form.Field
            name="lastName"
            children={(field) => (
              <>
                <label htmlFor={field.name}>Last Name:</label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </>
            )}
          />
        </div>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <button type="submit" disabled={!canSubmit}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        />
      </form>
      {submittedData && (
        <div>
          <h2>Submitted Data:</h2>
          <pre>{JSON.stringify(submittedData, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default App
