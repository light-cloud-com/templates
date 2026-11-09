import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CounterButton from '../CounterButton.vue'

describe('CounterButton', () => {
  it('counts clicks', async () => {
    const wrapper = mount(CounterButton)
    expect(wrapper.text()).toBe('Count is 0')
    await wrapper.trigger('click')
    expect(wrapper.text()).toBe('Count is 1')
  })
})
